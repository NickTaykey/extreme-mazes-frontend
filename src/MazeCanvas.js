import {
  moveRight,
  moveLeft,
  moveUp,
  moveDown,
  paintPlayer,
} from './player-helpers';
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { strokeMaze } from './maze-helpers';
import { io } from 'socket.io-client';

function MazeCanvas() {
  const wsConnectionStateRef = useRef(false);
  const playersListRef = useRef(null);
  const cellHeightRef = useRef(null);
  const cellWidthRef = useRef(null);
  const playerIdRef = useRef(null);
  const contextRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const mazeRef = useRef(null);

  const getCurrentPlayerObject = useCallback(() => {
    const id = Object.keys(playersListRef.current).find(
      (id) => id === playerIdRef.current
    );
    return playersListRef.current[id];
  }, []);

  const paintMaze = useCallback(() => {
    if (!mazeRef.current) return;

    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    strokeMaze(
      mazeRef.current,
      contextRef.current,
      cellWidthRef.current,
      cellHeightRef.current
    );
  }, []);

  const paintPlayers = useCallback(() => {
    if (!playersListRef.current) return;
    Object.values(playersListRef.current).forEach((p) => {
      paintPlayer(p.lastPosition, p.color, contextRef.current);
    });
  }, []);

  const paintPlayersAndMaze = useCallback(() => {
    // ===
    /* console.log(playersListRef.current);
    console.log(mazeRef.current);
    console.log(playerIdRef.current); */
    // ===
    paintMaze();
    paintPlayers();
  }, [paintMaze, paintPlayers]);

  const handleKeydown = useCallback(
    (e) => {
      const currentPlayerObject = getCurrentPlayerObject();

      switch (e.key) {
        case 'ArrowUp':
          moveUp(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current
          );
          break;
        case 'ArrowDown':
          moveDown(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current,
            canvasRef.current.height
          );
          break;
        case 'ArrowLeft':
          moveLeft(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current
          );
          break;
        case 'ArrowRight':
          moveRight(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current,
            canvasRef.current.width
          );
          break;
        default:
          break;
      }

      paintPlayersAndMaze();

      socketRef.current.emit('request-update-player-postion', {
        newPosition: currentPlayerObject.lastPosition,
        playerId: playerIdRef.current,
      });
    },
    [getCurrentPlayerObject, paintPlayersAndMaze]
  );

  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !mazeRef.current) return;

    const { CELL_PADDING, N_ROWS, N_COLS, CANVAS_SIZE } = mazeRef.current;

    canvasRef.current.height = canvasRef.current.width = 0;
    canvasRef.current.width = canvasRef.current.height = CANVAS_SIZE;
    contextRef.current = canvasRef.current.getContext('2d');

    cellWidthRef.current = (CANVAS_SIZE - 2 * CELL_PADDING) / N_COLS;
    cellHeightRef.current = (CANVAS_SIZE - 2 * CELL_PADDING) / N_ROWS;
  }, []);

  const params = useParams();

  useEffect(() => {
    if (wsConnectionStateRef.current || !params.id || !canvasRef.current) {
      return;
    }

    wsConnectionStateRef.current = true;

    socketRef.current = io('ws://localhost:8889');

    const storedPlayerId = localStorage.getItem(`maze-${params.id}-player`);

    if (storedPlayerId) {
      socketRef.current.emit('board-state-update-request', params.id);
      playerIdRef.current = storedPlayerId;
    } else {
      socketRef.current.emit('add-player', {
        mazeId: params.id,
      });
    }

    socketRef.current.on(
      'players-state-transmition',
      ({ currentPlayerId, playersList, JSONmaze }) => {
        if (!storedPlayerId) {
          playerIdRef.current = currentPlayerId;
        }
        mazeRef.current = JSON.parse(JSONmaze);
        playersListRef.current = playersList;
        setupCanvas();
        paintPlayersAndMaze();
      }
    );

    socketRef.current.on('update-board-state', (newPlayersList) => {
      playersListRef.current = newPlayersList;
      paintPlayersAndMaze();
    });

    socketRef.current.on(
      'update-player-position',
      ({ playerId, newPosition }) => {
        playersListRef.current[playerId].lastPosition = newPosition;
        paintPlayersAndMaze();
      }
    );

    window.addEventListener('keydown', handleKeydown);
  }, [params, paintMaze, handleKeydown, paintPlayersAndMaze, setupCanvas]);
  return <canvas ref={canvasRef}></canvas>;
}
export default MazeCanvas;
