import { useState, useRef, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useParams } from 'react-router-dom';

import Canvas from './canvas';
import ProjectBrowser from './projectbrowser';
import ColourPicker from './colourpicker';
import { createNewProject, fetchProjectById } from '../api';

const CANVAS_SIZE = 32;
const SCALE_FACTOR = 20;
const backgroundColor = "#FFFFFF";

const initialiseCanvas = (canvasRef, contextRef, lastMessage) => {
  const loadCanvas = message => {
    message.data.arrayBuffer().then((data) => {
      let d = new Uint8Array(data);
      setCanvasData(d);
    });
  };

  const setCanvasData = d => {
    let imageData = contextRef.current.createImageData(CANVAS_SIZE, CANVAS_SIZE);
    for (let i = 0; i < d.length; i++) {
      imageData.data[i] = d[i];
    }

    contextRef.current.putImageData(imageData, 0, 0);
  }

  const canvas = canvasRef.current;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  canvas.style.background = backgroundColor;

  // Stop right-click menu from appearing when interacting with the canvas:
  const preventDefault = (e) => e.preventDefault();
  canvas.addEventListener("contextmenu", preventDefault);

  canvas.style.width = `${CANVAS_SIZE * SCALE_FACTOR}px`;
  canvas.style.height = `${CANVAS_SIZE * SCALE_FACTOR}px`;
  canvas.style.imageRendering = "pixelated";

  const context = canvas.getContext("2d");
  contextRef.current = context;

  if (lastMessage !== null) { loadCanvas(lastMessage); }

  return () => {
    canvas.removeEventListener('contextmenu', preventDefault);
  };
}

const saveProject = (contextRef) => {
  const title = prompt('Please enter a project title');
  if (title !== undefined && title !== '') {
    try {
      createNewProject(
        title,
        Array.from(contextRef.current.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data)
      );
    } catch (err) {
      console.error(err);
    }
  }
}

const OfflineCanvasContainer = ({ colour }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => initialiseCanvas(canvasRef, contextRef, null));

  return <>
    <Canvas
      colour={colour}
      canvasRef={canvasRef}
      contextRef={contextRef}
      sendMessage={() => { }}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      scaleFactor={SCALE_FACTOR}
    />
    <button onClick={() => saveProject(contextRef)}>Save as Project</button>
  </>;
}

const OnlineCanvasContainer = ({ colour, setCurrentProject }) => {
  const { projectId } = useParams();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // This is an intentional misuse of the `protocols` field, but seems to be accepted - see:
  // - https://github.com/robtaussig/react-use-websocket/issues/94#issuecomment-1819338270
  // - https://ably.com/blog/websocket-authentication
  // - https://github.com/kubernetes/kubernetes/commit/714f97d7baf4975ad3aa47735a868a81a984d1f0
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:3000/edit`,
    {
      protocols: ['Authorization', localStorage.getItem('auth')],
      queryParams: { 's': projectId }
    }
  );

  useEffect(
    () => {
      initialiseCanvas(canvasRef, contextRef, lastMessage);
      fetchProjectById(projectId)
        .then(project => setCurrentProject(project))
        .catch(e => console.error(e));
    },
    [readyState, lastMessage, projectId, setCurrentProject]
  );

  return <Canvas
    colour={colour}
    canvasRef={canvasRef}
    contextRef={contextRef}
    sendMessage={sendMessage}
    width={CANVAS_SIZE}
    height={CANVAS_SIZE}
    scaleFactor={SCALE_FACTOR}
  />;
}

const Editor = ({ user }) => {
  const [isProjectBrowserOpen, setIsProjectBrowserOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [colour, setColour] = useState([150, 160, 170, 255]);
  const { projectId } = useParams();


  // Conditionally opening a websocket connection is apparently non-idiomatic
  // so instead we conditionally render a canvas container, one of which does
  // open a connection.
  //
  // TODO: Presently, logging in re-initialises and clears the canvas,
  //       losing the user's work without any sort of prompt.
  //       This needs to be fixed.
  //
  // TODO: This is a bit of a messy way to do a lo of conditional rendering.
  //       Is there a better solution here?
  //
  // TODO: Redirect users after creating a new project.
  return <>
    {
      user !== null && projectId !== undefined
        ? <>
          <div align="center">
            <h3>{currentProject !== null ? currentProject.title + ' - ' + currentProject.created_on : ''}</h3>
          </div>
          <OnlineCanvasContainer colour={colour} setCurrentProject={setCurrentProject} />
          </>
        : <>
          <div align="center">
            <h3>Untitled - Please Sign In to Open a Project</h3>
          </div>
          <OfflineCanvasContainer colour={colour} />
          </>
    }
    {
      user !== null && isProjectBrowserOpen
        ? <ProjectBrowser
          username={user}
          onClose={() => setIsProjectBrowserOpen(false)}
          setCurrentProject={setCurrentProject}
          closeProjectBrowser={() => setIsProjectBrowserOpen(false)}
        />
        : <></>
    }
    <ColourPicker colour={colour} setColour={setColour} />
    {
      user !== null ? <button onClick={() => { setIsProjectBrowserOpen(true)}} >Open</button> : <></>
    }
  </>
}


export default Editor;