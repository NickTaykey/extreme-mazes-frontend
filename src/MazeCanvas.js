import {
  moveRight,
  moveLeft,
  moveUp,
  moveDown,
  paintPlayer,
} from './player-helpers';
import { strokeMaze, CELL_PADDING } from './maze-helpers';
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function MazeCanvas() {
  const currentPlayerPositionRef = useRef(null);
  const cellHeightRef = useRef(null);
  const cellWidthRef = useRef(null);
  const contextRef = useRef(null);
  const canvasRef = useRef(null);
  const mazeRef = useRef(null);

  const handleKeydown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp':
        moveUp(
          currentPlayerPositionRef.current,
          mazeRef.current.JSONmaze,
          cellWidthRef.current,
          cellHeightRef.current
        );
        break;
      case 'ArrowDown':
        moveDown(
          currentPlayerPositionRef.current,
          mazeRef.current.JSONmaze,
          cellWidthRef.current,
          cellHeightRef.current,
          canvasRef.current.height
        );
        break;
      case 'ArrowLeft':
        moveLeft(
          currentPlayerPositionRef.current,
          mazeRef.current.JSONmaze,
          cellWidthRef.current,
          cellHeightRef.current
        );
        break;
      case 'ArrowRight':
        moveRight(
          currentPlayerPositionRef.current,
          mazeRef.current.JSONmaze,
          cellWidthRef.current,
          cellHeightRef.current,
          canvasRef.current.width
        );
        break;
      default:
        break;
    }
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    paintMaze(mazeRef.current.JSONmaze);
    paintPlayer(currentPlayerPositionRef.current, 'red', contextRef.current);
  }, []);

  const paintMaze = useCallback((maze) => {
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    strokeMaze(
      maze,
      contextRef.current,
      cellWidthRef.current,
      cellHeightRef.current
    );
  }, []);

  const params = useParams();

  useEffect(() => {
    const storedMaze = localStorage.getItem(`maze-${params.id}`);

    if (!params.id || !canvasRef.current || !storedMaze) return;

    canvasRef.current.height = canvasRef.current.width = 0;
    canvasRef.current.width = canvasRef.current.height = 750;
    contextRef.current = canvasRef.current.getContext('2d');

    const maze = JSON.parse(storedMaze);
    mazeRef.current = maze;

    cellWidthRef.current =
      (canvasRef.current.width - 2 * CELL_PADDING) / maze.JSONmaze.N_COLS;
    cellHeightRef.current =
      (canvasRef.current.height - 2 * CELL_PADDING) / maze.JSONmaze.N_ROWS;

    paintMaze(maze.JSONmaze);

    if (!currentPlayerPositionRef.current) {
      currentPlayerPositionRef.current = [
        cellWidthRef.current / 2,
        cellHeightRef.current / 2,
      ];
    }

    paintPlayer(currentPlayerPositionRef.current, 'red', contextRef.current);

    window.addEventListener('keydown', handleKeydown);
  }, [params, paintMaze]);
  return <canvas ref={canvasRef}></canvas>;
}
export default MazeCanvas;
