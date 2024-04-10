import { useEffect, useState } from 'react';
import { search } from '../api/post';
import createData from '../createData';
import Listing from './listing.jsx';
import Popup from './popup.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    // search({ order_by: 'likes', ascending: false, post_id: 'bad50740-f33a-11ee-87e2-b3758f99a7d8' })
    //   .then((result) => {console.log(result); setProjects(result)})
    //   .catch((error) => console.error(error));
    // createData('CC');
  }, []);
  return (
    <>
    {projects.length === 0 ? <> </> : <div>
      <ul>
        {projects.map((project) => (<li key={project.project_id}>{project.title}
          {<ul>
          {project.comments.map((comment) => (<li key={comment.comment_id}>
            {comment.comment_id}{comment.content}</li>))}
          </ul>}
        </li>))}
      </ul>
    </div>}
    <div>
      <div>Explore Page.</div>
      <img className="w-64 h-64 hover:cursor-pointer" src="sr25f64d3c492aws3.png" onClick={() => setPopupOpen(true)} />
      {popupOpen ?
        <Popup onClose={() => setPopupOpen(false)}>
          <Listing />
        </Popup>
        : ""
      }
    </div>
    </>
  );
};

export default ExplorePage;
