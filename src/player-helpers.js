export function paintPlayer(playerPosition, playerColor, ctx) {
  ctx.beginPath();
  ctx.moveTo(playerPosition[0], playerPosition[1]);
  ctx.fillStyle = playerColor;
  ctx.arc(playerPosition[0], playerPosition[1], 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

export function moveRight(
  playerPosition,
  maze,
  cellWidth,
  cellHeight,
  canvasWidth
) {
  if (playerPosition[0] + cellWidth >= canvasWidth) return false;

  const row = Math.ceil(playerPosition[1] / cellHeight) - 1;
  const newCell = Math.ceil(playerPosition[0] / cellWidth);

  if (maze.wallsVer[row][newCell] === 1) return false;

  playerPosition[0] += cellWidth;
  return true;
}

export function moveLeft(playerPosition, maze, cellWidth, cellHeight) {
  if (playerPosition[0] - cellWidth <= 0) return false;

  const row = Math.ceil(playerPosition[1] / cellHeight) - 1;
  const currentCell = Math.ceil(playerPosition[0] / cellWidth) - 1;

  if (maze.wallsVer[row][currentCell] === 1) return false;

  playerPosition[0] -= cellWidth;
  return true;
}

export function moveUp(playerPosition, maze, cellWidth, cellHeight) {
  if (playerPosition[1] - cellHeight <= 0) return false;

  const row = Math.ceil(playerPosition[1] / cellHeight) - 1;
  const currentCell = Math.ceil(playerPosition[0] / cellWidth) - 1;

  if (maze.wallsHor[row][currentCell] === 1) return false;

  playerPosition[1] -= cellHeight;
  return true;
}

export function moveDown(
  playerPosition,
  maze,
  cellWidth,
  cellHeight,
  canvasHeight
) {
  if (playerPosition[1] + cellHeight >= canvasHeight) return false;

  const newRow = Math.ceil(playerPosition[1] / cellHeight);
  const currentCell = Math.ceil(playerPosition[0] / cellWidth) - 1;

  if (maze.wallsHor[newRow][currentCell] === 1) return false;

  playerPosition[1] += cellHeight;
  return true;
}
