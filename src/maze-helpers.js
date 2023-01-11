export const CELL_PADDING = 2;

function ctxTranslate(cell, ctx, cellWidth, cellHeight) {
  ctx.save();
  ctx.translate(
    CELL_PADDING + cell.j * cellWidth,
    CELL_PADDING + cell.i * cellHeight
  );
}

function strokeCell(cell, ctx, cellWidth, cellHeight, wallsHor, wallsVer) {
  ctxTranslate(cell, ctx, cellWidth, cellHeight);

  let { i, j } = cell;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  if (wallsHor[i][j] === 1) {
    ctx.lineTo(cellWidth, 0);
  } else {
    ctx.moveTo(cellWidth, 0);
  }

  if (wallsVer[i][j + 1] === 1) {
    ctx.lineTo(cellWidth, cellHeight);
  } else {
    ctx.moveTo(cellWidth, cellHeight);
  }

  if (wallsHor[i + 1][j] === 1) {
    ctx.lineTo(0, cellHeight);
  } else {
    ctx.moveTo(0, cellHeight);
  }

  if (wallsVer[i][j] === 1) {
    ctx.lineTo(0, 0);
  } else {
    ctx.moveTo(0, 0);
  }

  ctx.stroke();
  ctx.restore();
}

export function strokeMaze(maze, ctx, cellWidth, cellHeight) {
  maze.allCells.forEach((cell) => {
    strokeCell(cell, ctx, cellWidth, cellHeight, maze.wallsHor, maze.wallsVer);
  });
}
