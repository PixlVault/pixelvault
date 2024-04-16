import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import LZString from 'lz-string';

import Canvas from './canvas';
import ProjectBrowser from './projectbrowser';
import Dropdown from './dropdown';
import Collab from './collab';

import * as project from '../api/project';
import * as post from '../api/post';
import * as comment from '../api/comment';
import Popup from './popup';
import toast from 'react-hot-toast';

const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;
const backgroundColor = '#FFFFFF';

const initialiseCanvas = (canvasRef, contextRef, initialData, canvasWidth, canvasHeight) => {
  const setCanvasData = (data) => {
    const imageData = contextRef.current.createImageData(canvasWidth, canvasHeight);
    Object.keys(data).forEach((i) => { imageData.data[i] = data[i]; });
    contextRef.current.putImageData(imageData, 0, 0);
  };

  const canvas = canvasRef.current;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.background = backgroundColor;

  // Stop right-click menu from appearing when interacting with the canvas:
  const preventDefault = (e) => e.preventDefault();
  canvas.addEventListener("contextmenu", preventDefault);

  // The canvasProportion determines the percentage of the viewport that the canvas
  // will always occupy. The canvas width is set to this percentage directly. The height
  // is set to the width multiplied by a factor that ensures the aspect ratio is maintained.
  const canvasProportion = 40;
  const aspectRatio = canvasHeight / canvasWidth;
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

const exportImage = async (canvasRef) => {
  const link = document.createElement('a');
  link.download = 'export.png';
  link.href = canvasRef.current.toDataURL();
  link.click();
};

const saveProject = async (contextRef, navigate, width, height) => {
  const title = prompt('Please enter a project title');
  if (title !== undefined && title !== '') {
    try {
      const obj = {
        data: Array.from(contextRef.current.getImageData(0, 0, width, height).data),
        width,
        height,
      };

      const compressedData = LZString.compressToBase64(JSON.stringify(obj));
      const newProjectId = await project.create(title, compressedData);
      if (newProjectId !== null) navigate(`${newProjectId}`);
    } catch (err) { console.error(err); }
  }
};
const ProjectSetup = ({ width, setWidth, height, setHeight, setDimsConfirmed, user }) => {
  const confirm = (e) => {
    e.preventDefault();

    const aspect = width / height;
    if (aspect > 5 || aspect < 0.2) {
      toast.error('Aspect Ratio must be between 0.2 and 5.0');
      return;
    }

    if (height >= 8 && height <= 256 && width >= 8 && width <= 256) {
      setDimsConfirmed(true);
    }
  };

  const [browserOpen, setBrowserOpen] = useState(false);

  return (<div className='m-4'>
    <div>
      <span className='font-semibold text-xl'>Start a new project:</span>
      <form className='flex flex-row gap-4 justify-center items-end mb-4'>
        <div>
          <label className='block text-gray-700 uppercase text-sm font-bold'>Width (max 256px)</label>
          <input type='number' value={width} min={8} max={256} onChange={(e) => setWidth(Number.parseInt(e.target.value, 10))} />
        </div>
        <div>
          <label className='block text-gray-700 uppercase text-sm font-bold'>Height (max 256px)</label>
          <input type='number' value={height} min={8} max={256} onChange={(e) => setHeight(Number.parseInt(e.target.value, 10))} />
        </div>
        <button className='h-8' type='submit' onClick={confirm}>Open</button>
      </form>
    </div>
    <div>
      <span className='font-semibold text-xl'>Or, </span>
      <span className='underline hover:cursor-pointer font-semibold text-xl' onClick={() => setBrowserOpen(true)}>
        open an existing one.
      </span>
      { browserOpen
        ? <Popup onClose={() => setBrowserOpen(false)} title={'Your Projects'}>
            <ProjectBrowser
              username={user}
              closeProjectBrowser={() => setIsProjectBrowserOpen(false)}
            />
          </Popup>
        : null }
    </div>
  </div>);
};

const OfflineCanvasContainer = ({ setIsProjectBrowserOpen, user }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const navigate = useNavigate();

  const [dimsConfirmed, setDimsConfirmed] = useState(false);
  const [width, setWidth] = useState(256);
  const [height, setHeight] = useState(256);

  useEffect(() => {
    if (dimsConfirmed) {
      initialiseCanvas(canvasRef, contextRef, null, width, height);
    }
  }, [dimsConfirmed]);

  return <>
    {
      !dimsConfirmed
        ? <Popup title='Edit Project' onClose={() => {}} hiddenClose={true}>
          <ProjectSetup width={width} setWidth={setWidth} height={height} setHeight={setHeight} setDimsConfirmed={setDimsConfirmed} user={user} />
          </Popup>
        : <div className="flex flex-col space-y-5">
          <div className="flex">
            <div className="grow">
              <h2 className="text-xl font-bold">New project {user ? '' : '(log in to save)'}</h2>
            </div>
            <Dropdown title="File">
              {user !== null ?
                <div>
                  <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => { setIsProjectBrowserOpen(true) }}>Open</div>
                  <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => saveProject(contextRef, navigate, width, height)}>Save as project</div>
                </div> : <></>}
              <div href="#" className="block px-4 py-2 text-sm hover:bg-gray-400" tabIndex="-1" onClick={() => exportImage(canvasRef)}>Export</div>
            </Dropdown>
          </div>

          <Canvas
            canvasRef={canvasRef}
            contextRef={contextRef}
            sendMessage={() => { }}
            width={width}
            height={height}
            canvasReady={true}
          />
        </div>
  }
  </>;
};

const socket = io(import.meta.env.VITE_WSS_URL, {
  path: '/ws/edit',
  auth: { token: localStorage.getItem('auth') },
  autoConnect: false,
});

const OnlineCanvasContainer = ({ currentProject, setCurrentProject, setIsProjectBrowserOpen }) => {
  const { projectId } = useParams();

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const navigate = useNavigate();

  const [connected, setConnected] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [width, setWidth] = useState(256);
  const [height, setHeight] = useState(256);

  const [collabPopupOpen, setCollabPopupOpen] = useState(false);

  useEffect(() => {
    project.get(projectId)
      .then((project) => setCurrentProject(project))
      .catch((error) => {
        if (error.message !== 'Project does not exist') console.error(error);
        setCurrentProject(null);
        navigate('../edit');
      });
  }, [projectId]);

  // This just a placeholder until we have a proper UI for publishing.
  const publishProject = async () => {
    try {
      await post.create(projectId);
      await post.edit(projectId, {
        licence: post.Licence.CreativeCommons,
        cost: 30,
        tags: ['tag1', 'looooooongtag2', 'tag3', 'tag4', 'looooooongtag5', 'tag6', 'tag7']
      });
    } catch (e) { toast.error(e.message); }

    await comment.addComment(projectId, "Test comment 1");
    await comment.addComment(projectId, "Test comment 2");
    await comment.addComment(projectId, "Test comment 3");
  };

  const collaborateClick = () => {
    setCollabPopupOpen(true);
  };

  useEffect(() => {
    socket.io.opts.query = { ...socket.io.opts.query, pid: projectId };
    socket.connect();

    socket.on('connect', () => setConnected(true));

    socket.on('load', (data) => {
      const decompressed = JSON.parse(LZString.decompressFromBase64(data));
      setWidth(decompressed.width);
      setHeight(decompressed.height);
      initialiseCanvas(canvasRef, contextRef, decompressed.data, decompressed.width, decompressed.height);
      setCanvasReady(true);
    });

    socket.on('joined', (user) => {
      toast(`${user} has joined the session`, { icon: '👋', position: 'bottom-right' });
    });

    socket.on('left', (user) => {
      toast(`${user} has left the session`, { icon: '👋', position: 'bottom-right' });
    });

    socket.on('error', (message) => {
      if (message === 'This project has been deleted.') {
        toast.error(message);
        setCurrentProject(null);
        navigate('../edit/');
      }

      if (message === 'You have been removed from this project.') {
        toast.error(message);
        setCurrentProject(null);
        navigate('../edit/');
      }

      if (message === 'Project has been published and can no longer be edited.') {
        toast.error('This project has been published and can no longer be edited.');
        setCurrentProject(null);
        navigate('../edit/');
      }

      console.error(message);
    });

    socket.on('update', (data) => {
      const imageData = contextRef.current.getImageData(0, 0, width, height);
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
      socket.off('joined');
      socket.off('left');
      socket.off('error');
      socket.disconnect();
    };
  }, [projectId]);

  if (canvasReady && !connected) toast.error('Disconnected from server! Changes will not be saved.');

  return <>
    <div className="flex flex-col space-y-5">
      <div className="flex">
        <div className="grow">
          <h2 className="text-xl font-bold">{currentProject !== null ? `${currentProject.title}` : ''}</h2>
        </div>
        <Dropdown title="File" >
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => { setIsProjectBrowserOpen(true) }}>Open</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={publishProject}>Publish</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => exportImage(canvasRef)}>Export</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => navigate('../edit/')}>Close Project</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={collaborateClick}>Collaborators</div>
        </Dropdown>
      </div>

      {
        collabPopupOpen ?
        <Popup onClose={() => setCollabPopupOpen(false)} title="Collaborators">
          <Collab projectId={currentProject.project_id} />
        </Popup>
          : ""
      }

      {!canvasReady ? <div className='bg-gray-400 flex items-center justify-center text-lg w-1/3 min-w-[33vw] h-1/3 min-h-[33vw] animate-pulse '>
        <span className={'text-black'}>Loading...</span>
      </div> : <></>}

      <Canvas
        canvasRef={canvasRef}
        contextRef={contextRef}
        sendMessage={(data) => { socket.emit('update', data); }}
        width={width}
        height={height}
        canvasReady={canvasReady}
      />
    </div>
  </>;
};

const Editor = ({ user }) => {
  const [isProjectBrowserOpen, setIsProjectBrowserOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Conditionally opening a websocket connection is apparently non-idiomatic so we
  // conditionally render a canvas container, one of which opens the connection.
  return <>
    {
      user !== null && projectId !== undefined
        ? <>
          <OnlineCanvasContainer currentProject={currentProject} setCurrentProject={setCurrentProject} setIsProjectBrowserOpen={setIsProjectBrowserOpen} />
        </>
        : <>
          <OfflineCanvasContainer setIsProjectBrowserOpen={setIsProjectBrowserOpen} user={user} />
        </>
    }
    {
      user !== null && isProjectBrowserOpen
        ? <>
          <Popup onClose={() => setIsProjectBrowserOpen(false)} title={'Your Projects'}>
            <ProjectBrowser
              username={user}
              currentProject={currentProject}
              setCurrentProject={setCurrentProject}
              closeProjectBrowser={() => setIsProjectBrowserOpen(false)}
            />
          </Popup>
        </>
        : null
    }
  </>;
};

export default Editor;
