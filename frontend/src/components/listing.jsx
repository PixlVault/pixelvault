import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

import * as postApi from './../api/post.js';
import * as projectApi from './../api/project.js';

const Listing = ({ postId }) => {
  const [loadedPost, setLoadedPost] = useState(null);
  const [loadedProject, setLoadedProject] = useState(null);

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
  }, []);

  return (
    <div>
      {loadedPost !== null && loadedProject !== null ?
        <div className="flex flex-col">

          <ListingInfo title={loadedPost.title} author={loadedPost.author} licence={loadedPost.licence} likes={loadedPost.likes} tags={loadedPost.tags}/>

          <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
            <textarea className="w-full h-12 resize-y border rounded-md p-2 max-h-32" placeholder="Add a comment..."></textarea>
            <button className="max-w-third mx-auto">Comment</button>
          </div>

          <div className="max-h-80 overflow-auto divide-y">
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
            <Comment />
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
