/**
 * Given two 2D points, returns an array of the points from
 * the first to the second.
 * This is based on the Wikipedia implementation of Bresenham's
 * line algorithm (https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm).
 * @param {number} x0 The `x` coordinate of the first point.
 * @param {number} y0 The `y` coordinate of the first point.
 * @param {number} x1 The `x` coordinate of the second point.
 * @param {number} y1 The `y` coordinate of the second point.
 * @returns {Array<number>} An array of points between (`x0`,`y0`) and (`x1`,`y1`).
 */
const getLinePoints = (x0, y0, x1, y1) => {
  if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
    if (x0 > x1) {
      return getLinePointsLow(x1, y1, x0, y0);
    } else {
      return getLinePointsLow(x0, y0, x1, y1);
    }
  } else {
    if (y0 > y1) {
      return getLinePointsHigh(x1, y1, x0, y0);
    } else {
      return getLinePointsHigh(x0, y0, x1, y1);
    }
  }
}

const getLinePointsLow = (x0, y0, x1, y1) => {
  let points = []

  let dx = x1 - x0;
  let dy = y1 - y0;
  let yi = 1;
  if (dy < 0) {
    yi = -1;
    dy = -dy;
  }

  let D = (2 * dy) - dx;
  let y = y0;

  for (let x = x0; x < x1; x++) {
    points.push({ x, y })

    if (D > 0) {
      y = y + yi;
      D = D + (2 * (dy - dx))
    } else {
      D = D + 2 * dy;
    }
  }

  return points;
}

const getLinePointsHigh = (x0, y0, x1, y1) => {
  let points = []

  let dx = x1 - x0
  let dy = y1 - y0
  let xi = 1
  if (dx < 0) {
    xi = -1
    dx = -dx
  }
  let D = (2 * dx) - dy;
  let x = x0

  for (let y = y0; y < y1; y++) {
    points.push({ x, y })

    if (D > 0) {
      x = x + xi
      D = D + (2 * (dx - dy))
    } else {
      D = D + 2 * dx;
    }
  }

  return points;
}

export default getLinePoints;