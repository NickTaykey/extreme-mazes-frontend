import { useCallback, useEffect, useRef } from 'react';
import PlayerControls from './PlayerControls';
import { useParams } from 'react-router-dom';
import { strokeMaze } from './maze-helpers';
import * as ph from './player-helpers';
import { io } from 'socket.io-client';
import './Button.css';

function MazeCanvas() {
  const currentPlayerLastPositionRef = useRef([]);
  const wsConnectionStateRef = useRef(false);
  const paintSinglePlayerRef = useRef(true);
  const cellHeightRef = useRef(null);
  const cellWidthRef = useRef(null);
  const playersListRef = useRef({});
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

    contextRef.current.beginPath();
    contextRef.current.fillStyle = 'white';
    contextRef.current.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    contextRef.current.fill();
    contextRef.current.closePath();

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
      ph.paintPlayer(p, contextRef.current);
    });
  }, []);

  const paintPlayersAndMaze = useCallback(() => {
    paintMaze();
    paintPlayers();
  }, [paintMaze, paintPlayers]);

  const handlePositionUpdate = useCallback(
    (key) => {
      if (key !== 'up' && key !== 'down' && key !== 'left' && key !== 'right') {
        return;
      }

      const currentPlayerObject = getCurrentPlayerObject();

      switch (key) {
        case 'up':
          ph.moveUp(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current
          );
          break;
        case 'down':
          ph.moveDown(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current,
            canvasRef.current.height
          );
          break;
        case 'left':
          ph.moveLeft(
            currentPlayerObject.lastPosition,
            mazeRef.current,
            cellWidthRef.current,
            cellHeightRef.current
          );
          break;
        case 'right':
          ph.moveRight(
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
        ph.paintPlayer(currentPlayerObject, contextRef.current);
      } else paintPlayersAndMaze();

      socketRef.current.emit('request-update-player-postion', {
        newPosition: currentPlayerObject.lastPosition,
        playerId: playerIdRef.current,
      });
    },
    [getCurrentPlayerObject, paintPlayersAndMaze, mazeId, paintMaze]
  );

  const handlePositionUpdateGenerator = useCallback(
    (direction) => {
      return () => handlePositionUpdate(direction);
    },
    [handlePositionUpdate]
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
    socketRef.current.emit('join', mazeId);

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
      ph.paintPlayer(currentPlayer, contextRef.current);
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

    socketRef.current.on('remove-disconnected-player', (playerId) => {
      delete playersListRef.current[playerId];
      paintPlayersAndMaze();
    });
  }, [mazeId, paintMaze, paintPlayersAndMaze, setupCanvas]);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      <PlayerControls
        handlePositionUpdateGenerator={handlePositionUpdateGenerator}
      />
    </>
  );
}

export default MazeCanvas;
