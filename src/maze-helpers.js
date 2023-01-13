function ctxTranslate(cell, ctx, maze) {
  ctx.save();
  ctx.translate(
    maze.CELL_PADDING + cell.j * maze.CELL_WIDTH,
    maze.CELL_PADDING + cell.i * maze.CELL_HEIGHT
  );
}

function strokeCell(cell, ctx, maze) {
  ctxTranslate(cell, ctx, maze);

  let { i, j } = cell;
  ctx.beginPath();
  ctx.moveTo(0, 0);

  if (maze.wallsHor[i][j] === 1) {
    ctx.lineTo(maze.CELL_WIDTH, 0);
  } else {
    ctx.moveTo(maze.CELL_WIDTH, 0);
  }

  if (maze.wallsVer[i][j + 1] === 1) {
    ctx.lineTo(maze.CELL_WIDTH, maze.CELL_HEIGHT);
  } else {
    ctx.moveTo(maze.CELL_WIDTH, maze.CELL_HEIGHT);
  }

  if (maze.wallsHor[i + 1][j] === 1) {
    ctx.lineTo(0, maze.CELL_HEIGHT);
  } else {
    ctx.moveTo(0, maze.CELL_HEIGHT);
  }

  if (maze.wallsVer[i][j] === 1) {
    ctx.lineTo(0, 0);
  } else {
    ctx.moveTo(0, 0);
  }

  ctx.stroke();
  ctx.restore();
}

export function strokeMaze(maze, ctx) {
  maze.allCells.forEach((cell) => {
    strokeCell(cell, ctx, maze);
  });
}
