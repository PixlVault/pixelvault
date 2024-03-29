import { useState } from 'react'

import pointsBetween from '../utils/line-points';

const CANVAS_SIZE = 32;
const SCALE_FACTOR = 20;

let prevMousePos = { x: 0, y: 0 }

const Canvas = ({ colour, sendMessage, canvasRef, contextRef }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);

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
  }

  const erasePixel = (x, y) => drawPixel(x, y, ([0, 0, 0, 0]));
  const erasePixels = (points) => drawPixels(points, ([0, 0, 0, 0]));
  
  // Place a single pixel - `pixelColour` is optional; will defer to `colour` instead.
  const drawPixel = (x, y, pixelColour = colour) => {
    const [r, g, b, a] = pixelColour;

    let scaledX = Math.floor(x / SCALE_FACTOR);
    let scaledY = Math.floor(y / SCALE_FACTOR);

    let pixelData = contextRef.current.getImageData(scaledX, scaledY, 1, 1);

    for (let i = 0; i < pixelData.data.length; i += 4) {
      pixelData.data[i + 0] = r;
      pixelData.data[i + 1] = g;
      pixelData.data[i + 2] = b;
      pixelData.data[i + 3] = a;
    }

    contextRef.current.putImageData(pixelData, scaledX, scaledY);
  }

  const drawPixels = (points, pixelColour = colour) => {
    let pixelData = contextRef.current.getImageData(0, 0, CANVAS_SIZE * SCALE_FACTOR, CANVAS_SIZE * SCALE_FACTOR);

    for (let i = 0; i < points.length; i++) {
      const scaledX = Math.floor(points[i].x / SCALE_FACTOR);
      const scaledY = Math.floor(points[i].y / SCALE_FACTOR);

      setPixel(scaledX, scaledY, pixelColour, pixelData);
    }

    contextRef.current.putImageData(pixelData, 0, 0);
  }

  const setPixel = (x, y, pixelColour, pixelData) => {
    const redIndex = y * (CANVAS_SIZE * SCALE_FACTOR * 4) + x * 4;
    const greenIndex = redIndex + 1;
    const blueIndex = redIndex + 2;
    const alphaIndex = redIndex + 3;

    const [r, g, b, a] = pixelColour;
    pixelData.data[redIndex] = r;
    pixelData.data[greenIndex] = g;
    pixelData.data[blueIndex] = b;
    pixelData.data[alphaIndex] = a;
  }

  const getCanvasState = () => 
    contextRef.current.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

  const areAdjacent = (x0, y0, x1, y1) => {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    return dx <= 1 && dy <= 1;
  }

  // We're triggering this on "mouse moved" events which don't fire fast enough
  // for quickly drawn lines, so you get gaps in the drawn line. To workaround this,
  // we draw a line between the previously seen mouse point and the current one if they
  // are not adjacent.
  const draw = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;

    if (areAdjacent(prevMousePos.x, prevMousePos.y, x, y)){
      if (isDrawing) {
        drawPixel(x, y);
      } else if (isErasing) {
        erasePixel(x, y);
      }
    } else {
      if (isDrawing) {
        drawLine(prevMousePos.x, prevMousePos.y, x, y);
      } else if (isErasing) {
        eraseLine(prevMousePos.x, prevMousePos.y, x, y);
      }
    }

    prevMousePos = { x, y };
  }

  const endDrawing = () => {
    setIsDrawing(false);
    setIsErasing(false);
    sendMessage(getCanvasState());
  }

  const mouseLeftCanvas = () => setIsDrawing(false);

  const drawLine = (x0, y0, x1, y1) => {
    const points = pointsBetween(x0, y0, x1, y1);
    drawPixels(points);
  }

  const eraseLine = (x0, y0, x1, y1) => {
    const points = pointsBetween(x0, y0, x1, y1);
    erasePixels(points);
  }
  
  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseUp={endDrawing}
      onMouseMove={draw}
      onMouseLeave={mouseLeftCanvas}
      ref={canvasRef}
    />
    );
};

export default Canvas;
