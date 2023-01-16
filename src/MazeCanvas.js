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
  const currentPlayerLastPositionRef = useRef(null);
  const wsConnectionStateRef = useRef(false);
  const paintSinglePlayerRef = useRef(true);
  const cellHeightRef = useRef(null);
  const cellWidthRef = useRef(null);
  const playersListRef = useRef([]);
  const playerIdRef = useRef(null);
  const contextRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const mazeRef = useRef(null);

  const { id: mazeId } = useParams();

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
      if (
        e.key !== 'ArrowUp' &&
        e.key !== 'ArrowDown' &&
        e.key !== 'ArrowLeft' &&
        e.key !== 'ArrowRight'
      ) {
        return;
      }

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

      currentPlayerLastPositionRef.current = currentPlayerObject.lastPosition;
      localStorage.setItem(
        `maze-${mazeId}-player-position`,
        JSON.stringify(currentPlayerLastPositionRef.current)
      );

      if (paintSinglePlayerRef.current) {
        paintMaze();
        paintPlayer(
          currentPlayerObject.lastPosition,
          currentPlayerObject.color,
          contextRef.current
        );
      } else paintPlayersAndMaze();

      socketRef.current.emit('request-update-player-postion', {
        newPosition: currentPlayerObject.lastPosition,
        playerId: playerIdRef.current,
      });
    },
    [getCurrentPlayerObject, paintPlayersAndMaze, mazeId]
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

  useEffect(() => {
    if (wsConnectionStateRef.current || !mazeId || !canvasRef.current) {
      return;
    }

    wsConnectionStateRef.current = true;

    socketRef.current = io('ws://localhost:8889');

    const storedPlayerId = localStorage.getItem(`maze-${mazeId}-player-id`);

    if (storedPlayerId) {
      playerIdRef.current = storedPlayerId;
      socketRef.current.emit('board-state-update-request', {
        playerId: playerIdRef.current,
        mazeId,
      });
    } else {
      socketRef.current.emit('add-player', mazeId);
    }

    socketRef.current.on(
      'players-state-transmition',
      ({ playerId, JSONmaze, playerObject }) => {
        currentPlayerLastPositionRef.current = playerObject.lastPosition;

        if (!storedPlayerId) {
          currentPlayerLastPositionRef.current = playerObject.lastPosition;
          localStorage.setItem(`maze-${mazeId}-player-id`, playerId);
          playerIdRef.current = playerId;
        } else {
          currentPlayerLastPositionRef.current = JSON.parse(
            localStorage.getItem(`maze-${mazeId}-player-position`)
          );
        }

        mazeRef.current = JSON.parse(JSONmaze);
        setupCanvas();
      }
    );

    socketRef.current.on('update-board-state', (newPlayersList) => {
      playersListRef.current = newPlayersList;
      const currentPlayer = playersListRef.current[playerIdRef.current];
      currentPlayer.lastPosition = currentPlayerLastPositionRef.current;
      paintMaze();
      paintPlayer(
        currentPlayer.lastPosition,
        currentPlayer.color,
        contextRef.current
      );
    });

    socketRef.current.on(
      'update-player-position',
      ({ playerId, newPosition }) => {
        if (playerId !== playerIdRef.current) {
          paintSinglePlayerRef.current = false;
          playersListRef.current[playerId].lastPosition = newPosition;
          paintPlayersAndMaze();
        }
      }
    );

    window.addEventListener('keydown', handleKeydown);
  }, [mazeId, paintMaze, handleKeydown, paintPlayersAndMaze, setupCanvas]);

  return <canvas ref={canvasRef}></canvas>;
}

export default MazeCanvas;
