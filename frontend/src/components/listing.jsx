import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

import * as postApi from './../api/post.js';
import * as projectApi from './../api/project.js';

const Listing = ({ postId }) => {
  const [loadedPost, setLoadedPost] = useState(null);
  const [loadedProject, setLoadedProject] = useState(null);
  const [dataChanged, setDataChanged] = useState(false);
  const newCommentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const posts = await postApi.search({ post_id: postId });
      const post = posts[0]
      if (post === null || post === undefined) {
        console.error("Failed to retrieve post data.");
        return;
      }

      console.log("post: " + JSON.stringify(post));

      const project = await projectApi.get(postId);
      if (project === null) {
        console.error("Failed to retrieve project data.");
        return;
      }

      console.log("project: " + JSON.stringify(project));

      setLoadedPost(post);
      setLoadedProject(project);
    }

    fetchData().catch(console.error);
    setDataChanged(false);
  }, [dataChanged]);

  const submitComment = () => {
    const content = newCommentRef.current.value;
    if (content.length == 0) {
      return;
    }

    postApi.addComment(postId, content);
    setDataChanged(true);
  }

  return (
    <div>
      {loadedPost !== null && loadedProject !== null ?
        <div className="flex flex-col">

          <ListingInfo postId={postId} title={loadedPost.title} author={loadedPost.author} licence={loadedPost.licence} likes={loadedPost.likes} tags={loadedPost.tags} />

          <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
            <textarea ref={newCommentRef} className="w-full h-12 resize-y border rounded-md p-2 max-h-32" placeholder="Add a comment..."></textarea>
            <button className="max-w-third mx-auto" onClick={submitComment}>Comment</button>
          </div>

          <div className="max-h-80 overflow-auto divide-y">
            {
              loadedPost.comments.map(c => <Comment author={c.author} content={c.content} likes={c.likes} />)
            }
          </div>

          <div className="flex justify-center">
            <Link to="#">More like this...</Link>
          </div>
        </div>
        :
        ""}
    </div>
  );
};

export default Listing;
