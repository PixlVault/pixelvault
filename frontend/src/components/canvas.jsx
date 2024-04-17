import { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

import Dropdown from './dropdown';

import pointsBetween from '../utils/line-points';

// Prevent the undo stack getting too large.
// Lower this to potentially improve memory usage.
const UNDO_LIMIT = 50;

let prevMousePos = { x: 0, y: 0 };
let changeBuffer = {};
let undoBuffer = {};

const undoHistory = [];
let redoHistory = [];

const areAdjacent = (x0, y0, x1, y1) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  return dx <= 1 && dy <= 1;
};

// Javascript doesn't have enums so this let's us do something like that.
const Tools = {
  Pencil: "Pencil",
  Eraser: "Eraser",
  Eyedropper: "Eyedropper"
};

const PixelSize = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4
};

const Canvas = ({
  sendMessage, canvasRef, contextRef, width, height, canvasReady,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [colour, setColour] = useState([150, 160, 170, 255]);
  const [selectedTool, setSelectedTool] = useState(Tools.Pencil);
  const [pixelSize, setPixelSize] = useState(PixelSize.One);

  const getWidthScaleFactor = () => canvasRef.current.offsetWidth / width;
  const getHeightScaleFactor = () => canvasRef.current.offsetHeight / height;

  const undo = (() => {
    if (undoHistory.length === 0) return;
    const change = undoHistory.pop();

    sendMessage(JSON.stringify(change));
    const pixelData = contextRef.current.getImageData(0, 0, width, height);

    const redoBuffer = {};
    Object.keys(change).forEach((i) => {
      redoBuffer[i] = pixelData.data[i];
      pixelData.data[i] = change[i];
    });
    redoHistory.push(redoBuffer);

    contextRef.current.putImageData(pixelData, 0, 0);
  });

  const redo = (() => {
    if (redoHistory.length === 0) return;
    const change = redoHistory.pop();

    sendMessage(JSON.stringify(change));
    const pixelData = contextRef.current.getImageData(0, 0, width, height);
    const tmpUndoBuffer = {};
    Object.keys(change).forEach((i) => {
      tmpUndoBuffer[i] = pixelData.data[i];
      pixelData.data[i] = change[i];
    });
    undoHistory.push(tmpUndoBuffer);

    contextRef.current.putImageData(pixelData, 0, 0);
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.keyCode === 89 && e.ctrlKey) || (e.keyCode === 90 && e.ctrlKey && e.shiftKey)) redo();
      else if (e.keyCode === 90 && e.ctrlKey) undo();
    };

    document.addEventListener('keydown', handleKeyDown);

    return (() => {
      document.removeEventListener('keydown', handleKeyDown);
    });
  }, [contextRef, height, width, sendMessage]);

  /**
   * Sets a single pixel given some ImageData.
   * @param {number} x The x coordinate of the pixel.
   * @param {number} y The y coordinate of the pixel.
   * @param {Array<number>} pixelColour A 4-element array of the r, g, b, a values to set.
   * @param {*} pixelData The `ImageData` object to alter.
   */
  const setPixel = (x, y, pixelColour, pixelData) => {
    // We need to guard against setting pixels outside of the canvas, otherwise
    // it wraps around to the other side.
    if (x < 0 || x > width-1 || y < 0 || y > height) {
      return;
    }

    const redIndex = y * (width * 4) + x * 4;
    const greenIndex = redIndex + 1;
    const blueIndex = redIndex + 2;
    const alphaIndex = redIndex + 3;

    const [r, g, b, a] = pixelColour;

    // Keep track of the pre-edit state of the canvas.
    // This undefined test guards against cases where the same pixel is visited
    // twice in the same action. Not doing this leads to incomplete undo behaviour.
    undoBuffer[redIndex] = undoBuffer[redIndex] === undefined
      ? pixelData.data[redIndex]
      : undoBuffer[redIndex];

    undoBuffer[greenIndex] = undoBuffer[greenIndex] === undefined
      ? pixelData.data[greenIndex]
      : undoBuffer[greenIndex];

    undoBuffer[blueIndex] = undoBuffer[blueIndex] === undefined
      ? pixelData.data[blueIndex]
      : undoBuffer[blueIndex];

    undoBuffer[alphaIndex] = undoBuffer[alphaIndex] === undefined
      ? pixelData.data[alphaIndex]
      : undoBuffer[alphaIndex];

    // Store the changes that have been made to the canvas.
    changeBuffer[redIndex] = r;
    changeBuffer[greenIndex] = g;
    changeBuffer[blueIndex] = b;
    changeBuffer[alphaIndex] = a;

    // Action the change to the canvas.
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

      const pixels = getSizedPixels(points[i].x, points[i].y, pixelSize);
      for (let j = 0; j < pixels.length; j++) {
        setPixel(pixels[j].x, pixels[j].y, pixelColour, pixelData);
      }

    }
    contextRef.current.putImageData(pixelData, 0, 0);
  };

  const getSizedPixels = (x, y, size) => {
    let points = [];

    switch (size) {
      case PixelSize.Four:
        points.push({ x: x - 2, y: y + 1 });
        points.push({ x: x - 2, y: y });
        points.push({ x: x - 2, y: y - 1 });
        points.push({ x: x - 2, y: y - 2 });
        points.push({ x: x - 1, y: y - 2 });
        points.push({ x: x, y: y - 2 });
        points.push({ x: x + 1, y: y - 2 });
      case PixelSize.Three:
        points.push({ x: x + 1, y: y - 1 })
        points.push({ x: x + 1, y: y })
        points.push({ x: x + 1, y: y + 1 })
        points.push({ x: x, y: y + 1 })
        points.push({ x: x - 1, y: y + 1 })
      case PixelSize.Two:
        points.push({ x: x - 1, y: y })
        points.push({ x: x - 1, y: y - 1 })
        points.push({ x: x, y: y - 1 })
      case PixelSize.One:
        points.push({ x, y })
        break;
      default:
        console.error(`Unknown pixel size: ${size}`);
    }

    return points;
  }

  const drawPixel = (x, y, pixelColour = colour) => {
    const scaledPoint = scale({ x, y });
    drawPixels([scaledPoint], pixelColour);
  };

  const erasePixel = (x, y) => drawPixel(x, y, ([0, 0, 0, 0]));
  const erasePixels = (points) => drawPixels(points, ([0, 0, 0, 0]));

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX: x, offsetY: y } = nativeEvent;
    prevMousePos = { x, y };

    if (selectedTool == Tools.Eyedropper) {
      const colour = getColourAt(scale({x, y}));
      setColour(colour);
    } else if (selectedTool == Tools.Eraser) {
      setIsErasing(true);
      erasePixel(x, y);
    } else {
      setIsDrawing(true);
      drawPixel(x, y);
    }
  };

  const getColourAt =({x, y}) => {
    return contextRef.current.getImageData(x, y, 1, 1).data;
  }

  const scaledPointsBetween = (x0, y0, x1, y1) => {
    const scaledPoint0 = scale({ x: x0, y: y0 });
    const scaledPoint1 = scale({ x: x1, y: y1 });
    return pointsBetween(scaledPoint0.x, scaledPoint0.y, scaledPoint1.x, scaledPoint1.y);
  }

  const drawLine = (x0, y0, x1, y1) => {
    const points = scaledPointsBetween(x0, y0, x1, y1);
    drawPixels(points);
  };

  const eraseLine = (x0, y0, x1, y1) => {
    const points = scaledPointsBetween(x0, y0, x1, y1);
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

    // Append the action to the undo history, and empty the redo history due
    // to the actions it may refer to now being invalidated.
    redoHistory = [];
    undoHistory.push(undoBuffer);
    if (undoHistory.length > UNDO_LIMIT) undoHistory.shift();
    undoBuffer = {};
  };

  const clear = () => {
    var points = []
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        points.push({ x, y });
      }
    }

    erasePixels(points);

    endDrawing();
  }

  const mouseLeftCanvas = () => setIsDrawing(false);


  return (
    <div className="flex space-x-10">
      <div>
        <div className="flex flex-col w-10 bg-white rounded-md divide-y">
          <div>
            <img className={`hover:cursor-pointer rounded-t-md hover:bg-gray-400 p-3 ${selectedTool == Tools.Pencil ? "bg-gray-400" : ""}`} title="Pencil Tool" src="/pencil.png" onClick={() => setSelectedTool(Tools.Pencil)} />
            <img className={`hover:cursor-pointer hover:bg-gray-400 p-3 ${selectedTool == Tools.Eraser ? "bg-gray-400" : ""}`} title="Eraser Tool" src="/eraser.png" onClick={() => setSelectedTool(Tools.Eraser)} />

            <Dropdown titleElement={<img className={`hover:cursor-pointer hover:bg-gray-400 p-3`} title="Pixel Size" src="/grid.png" />} width={8}>
              <div className={`block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer ${pixelSize == PixelSize.One ? "bg-gray-400" : ""}`} tabIndex="-1" onClick={() => setPixelSize(PixelSize.One)}>1px</div>
              <div className={`block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer ${pixelSize == PixelSize.Two ? "bg-gray-400" : ""}`} tabIndex="-1" onClick={() => setPixelSize(PixelSize.Two)}>2px</div>
              <div className={`block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer ${pixelSize == PixelSize.Three ? "bg-gray-400" : ""}`} tabIndex="-1" onClick={() => setPixelSize(PixelSize.Three)}>3px</div>
              <div className={`block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer ${pixelSize == PixelSize.Four ? "bg-gray-400" : ""}`} tabIndex="-1" onClick={() => setPixelSize(PixelSize.Four)}>4px</div>
            </Dropdown>

            <img className={`hover:cursor-pointer hover:bg-gray-400 p-3 ${selectedTool == Tools.Eyedropper ? "bg-gray-400" : ""}`} title="Eyedropper Tool" src="/eyedropper.png" onClick={() => setSelectedTool(Tools.Eyedropper)} />

            <Dropdown titleElement={<div className="p-2 hover:cursor-pointer"><div className="w-5 h-5 p-3 m-auto" title="Colour Picker" style={{ backgroundColor: `rgba(${colour[0]}, ${colour[1]}, ${colour[2]}, ${colour[3] / 255})` }}></div></div>}>
              <div className="flex justify-center">
                <SketchPicker
                  color={{ r: colour[0], g: colour[1], b: colour[2], a: colour[3] / 255 }}
                  onChange={(c) => setColour([c.rgb.r, c.rgb.g, c.rgb.b, c.rgb.a * 255])}
                />
              </div>
            </Dropdown>
          </div>
          <div>
            <img className="hover:cursor-pointer hover:bg-gray-400 p-3" title="Undo" src="/undo.png" onClick={undo} />
            <img className="hover:cursor-pointer hover:bg-gray-400 p-3" title="Redo" src="/redo.png" onClick={redo} />
            <img className="hover:cursor-pointer rounded-b-md hover:bg-gray-400 p-3" title="Clear" src="/bin.png" onClick={clear} />
          </div>
        </div>
      </div>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={mouseLeftCanvas}
        ref={canvasRef}
        className={canvasReady ? '' : 'invisible'}
      />
    </div>
  );
};

export default Canvas;
