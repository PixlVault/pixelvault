import { useState } from 'react';

import pointsBetween from '../utils/line-points';

let prevMousePos = { x: 0, y: 0 };
let changeBuffer = {};

const areAdjacent = (x0, y0, x1, y1) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  return dx <= 1 && dy <= 1;
};

const Canvas = ({
  colour, sendMessage, canvasRef, contextRef, width, height, canvasReady,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

  const getWidthScaleFactor = () => canvasRef.current.offsetWidth / width;
  const getHeightScaleFactor = () => canvasRef.current.offsetHeight / height;

  /**
   * Sets a single pixel given some ImageData.
   * @param {number} x The x coordinate of the pixel.
   * @param {number} y The y coordinate of the pixel.
   * @param {Array<number>} pixelColour A 4-element array of the r, g, b, a values to set.
   * @param {*} pixelData The `ImageData` object to alter.
   */
  const setPixel = (x, y, pixelColour, pixelData) => {
    const redIndex = y * (width * 4) + x * 4;
    const greenIndex = redIndex + 1;
    const blueIndex = redIndex + 2;
    const alphaIndex = redIndex + 3;

    const [r, g, b, a] = pixelColour;

    changeBuffer[redIndex] = r;
    changeBuffer[greenIndex] = g;
    changeBuffer[blueIndex] = b;
    changeBuffer[alphaIndex] = a;

    pixelData.data[redIndex] = r;
    pixelData.data[greenIndex] = g;
    pixelData.data[blueIndex] = b;
    pixelData.data[alphaIndex] = a;
  };

  const scale = (point) => {
    const scaledX = Math.floor(point.x / getWidthScaleFactor());
    const scaledY = Math.floor(point.y / getHeightScaleFactor());
    return { x: scaledX, y: scaledY };
  };

  const drawPixels = (points, pixelColour = colour) => {
    const pixelData = contextRef.current.getImageData(0, 0, width, height);
    for (let i = 0; i < points.length; i += 1) {
      setPixel(points[i].x, points[i].y, pixelColour, pixelData);
    }
    contextRef.current.putImageData(pixelData, 0, 0);
  };

  const drawPixel = (x, y, pixelColour = colour) => {
    const scaledPoint = scale({ x, y });
    drawPixels([scaledPoint], pixelColour);
  };

  const erasePixel = (x, y) => drawPixel(x, y, ([0, 0, 0, 0]));
  const erasePixels = (points) => drawPixels(points, ([0, 0, 0, 0]));

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;
    prevMousePos = { x, y };

    // Use mouse button to determine drawing or erasing - '2' == Right Mouse Button
    // (LMB === 0 -- or 1, for Internet Explorer):
    if (nativeEvent.button === 2) {
      setIsErasing(true);
      erasePixel(x, y);
    } else {
      setIsDrawing(true);
      drawPixel(x, y);
    }
  };

  const drawLine = (x0, y0, x1, y1) => {
    const scaledPoint0 = scale({ x: x0, y: y0 });
    const scaledPoint1 = scale({ x: x1, y: y1 });
    const points = pointsBetween(scaledPoint0.x, scaledPoint0.y, scaledPoint1.x, scaledPoint1.y);
    drawPixels(points);
  };

  const eraseLine = (x0, y0, x1, y1) => {
    const points = pointsBetween(x0, y0, x1, y1);
    erasePixels(points);
  };

  // We're triggering this on "mouse moved" events which don't fire fast enough
  // for quickly drawn lines, so you get gaps in the drawn line. To workaround this,
  // we draw a line between the previously seen mouse point and the current one if they
  // are not adjacent.
  const draw = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;
    if (areAdjacent(prevMousePos.x, prevMousePos.y, x, y)) {
      if (isDrawing) {
        drawPixel(x, y);
      } else if (isErasing) {
        erasePixel(x, y);
      }
    } else if (isDrawing) {
      drawLine(prevMousePos.x, prevMousePos.y, x, y);
    } else if (isErasing) {
      eraseLine(prevMousePos.x, prevMousePos.y, x, y);
    }
    prevMousePos = { x, y };
  };

  const endDrawing = () => {
    setIsDrawing(false);
    setIsErasing(false);
    sendMessage(JSON.stringify(changeBuffer));
    changeBuffer = {};
  };

  const mouseLeftCanvas = () => setIsDrawing(false);

  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseUp={endDrawing}
      onMouseMove={draw}
      onMouseLeave={mouseLeftCanvas}
      ref={canvasRef}
      className={canvasReady ? '' : 'invisible'}
    />
  );
};

export default Canvas;
