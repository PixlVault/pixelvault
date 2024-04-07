import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import LZString from 'lz-string';


import Canvas from './canvas';
import ProjectBrowser from './projectbrowser';
import ColourPicker from './colourpicker';
import { createNewProject, fetchProjectById } from '../api';

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;
const backgroundColor = '#FFFFFF';

const initialiseCanvas = (canvasRef, contextRef, initialData) => {
  const setCanvasData = (data) => {
    const imageData = contextRef.current.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    Object.keys(data).forEach((i) => { imageData.data[i] = data[i]; });
    contextRef.current.putImageData(imageData, 0, 0);
  };

  const canvas = canvasRef.current;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  canvas.style.background = backgroundColor;

  // Stop right-click menu from appearing when interacting with the canvas:
  const preventDefault = (e) => e.preventDefault();
  canvas.addEventListener("contextmenu", preventDefault);

  // The canvasProportion determines the percentage of the viewport that the canvas
  // will always occupy. The canvas width is set to this percentage directly. The height
  // is set to the width multiplied by a factor that ensures the aspect ratio is maintained.
  const canvasProportion = 33;
  const aspectRatio = CANVAS_HEIGHT / CANVAS_WIDTH;
  const width = canvasProportion;
  const height = width * aspectRatio;
  canvas.style.width = width + 'vw';
  canvas.style.height = height + 'vw';

  canvas.style.imageRendering = "pixelated";

  const context = canvas.getContext("2d");
  contextRef.current = context;

  if (initialData !== null) {
    setCanvasData(initialData);
  }

  return () => {
    canvas.removeEventListener('contextmenu', preventDefault);
  };
};

const saveProject = async (contextRef, navigate) => {
  const title = prompt('Please enter a project title');
  if (title !== undefined && title !== '') {
    try {
      const compressedData = LZString.compressToBase64(JSON.stringify(
        Array.from(contextRef.current.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data),
      ));
      const response = await createNewProject(title, compressedData);
      if (response.projectId !== undefined) {
        navigate(`${response.projectId}`);
      }
    } catch (err) { console.error(err); }
  }
};

const OfflineCanvasContainer = ({ colour }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => initialiseCanvas(canvasRef, contextRef, null), []);

  return <>
    <Canvas
      colour={colour}
      canvasRef={canvasRef}
      contextRef={contextRef}
      sendMessage={() => { }}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      canvasReady={true}
    />
    <button onClick={() => saveProject(contextRef, navigate)}>Save as Project</button>
  </>;
};

const Alert = ({ message }) => {
  return <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'>
    <span>{message}</span>
  </div>;
};

const socket = io(import.meta.env.VITE_WSS_URL, {
  path: '/edit',
  auth: { token: localStorage.getItem('auth') },
  autoConnect: false,
});

const OnlineCanvasContainer = ({ colour, setCurrentProject }) => {
  const { projectId } = useParams();

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId)
      .then((project) => setCurrentProject(project))
      .catch((error) => console.error(error));
  }, [projectId]);

  useEffect(() => {
    socket.io.opts.query = { ...socket.io.opts.query, pid: projectId };
    socket.connect();

    socket.on('connect', () => setConnected(true));

    socket.on('load', (data) => {
      const decompressed = JSON.parse(LZString.decompressFromBase64(data));
      initialiseCanvas(canvasRef, contextRef, decompressed);
      setCanvasReady(true);
    });

    socket.on('update', (data) => {
      const imageData = contextRef.current.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const parsed = JSON.parse(data);
      Object.keys(parsed).forEach((pixel) => {
        imageData.data[pixel] = parsed[pixel];
      });
      contextRef.current.putImageData(imageData, 0, 0);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      setCanvasReady(false);
    });

    return () => {
      setConnected(false);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('load');
      socket.off('update');
      socket.disconnect();
    };
  }, [projectId]);

  return <>
    { canvasReady && !connected ? <Alert message={'WARNING: Disconnected from server! Changes will not be saved.'} /> : null }
    { !canvasReady ? <div className='text-center text-lg w-1/3 min-w-[33vw] h-1/3 min-h-[33vw]'><span>Loading...</span></div> : <></> }
    <Canvas
      colour={colour}
      canvasRef={canvasRef}
      contextRef={contextRef}
      sendMessage={(data) => { socket.emit('update', data); }}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      canvasReady={canvasReady}
    />
  </>;
};

const Editor = ({ user }) => {
  const [isProjectBrowserOpen, setIsProjectBrowserOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [colour, setColour] = useState([150, 160, 170, 255]);
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Conditionally opening a websocket connection is apparently non-idiomatic so we
  // conditionally render a canvas container, one of which opens the connection.
  return <>
    {
      user !== null && projectId !== undefined
        ? <div>
          <div align="center">
            <h3>{currentProject !== null ? `Currently Editing ${currentProject.title}` : ''}</h3>
          </div>
          <OnlineCanvasContainer colour={colour} setCurrentProject={setCurrentProject} />
          <button onClick={() => navigate('../edit/')} >Close</button>
        </div>
        : <>
          <div align="center">
            <h3>Untitled - Please Open a Project</h3>
          </div>
          <OfflineCanvasContainer colour={colour} />
        </>
    }
    {
      user !== null && isProjectBrowserOpen
        ? <>
          <ProjectBrowser
            username={user}
            onClose={() => setIsProjectBrowserOpen(false)}
            setCurrentProject={setCurrentProject}
            closeProjectBrowser={() => setIsProjectBrowserOpen(false)}
          />
        </>
        : null
    }
    <ColourPicker colour={colour} setColour={setColour} />
    {
      user !== null
        ? <button onClick={() => { setIsProjectBrowserOpen(true)}} >Open</button> 
        : <></>
    }
  </>;
};

export default Editor;
