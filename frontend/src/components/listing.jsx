import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

import * as postApi from './../api/post.js';
import * as commentApi from './../api/comment.js';

const Listing = ({ user, postId }) => {
  const [loadedPost, setLoadedPost] = useState(null);
  const [likedThisPost, setLikedThisPost] = useState(false);
  const [likedComments, setLikedComments] = useState(false);
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

      const likedPosts = await postApi.likedBy(user);
      if (likedPosts === null || likedPosts === undefined) {
        console.error("Failed to retrieve liked posts.");
        return;
      }

      const likedComments = await commentApi.likedBy(user);
      if (likedComments === null || likedComments === undefined) {
        console.error("Failed to retrieve liked comments.");
        return;
      }

      setLikedThisPost(likedPosts.map(p => p.post_id).includes(postId));
      setLikedComments(likedComments);
      setLoadedPost(post);
    }

    fetchData().catch(console.error);
    setDataChanged(false);
  }, [dataChanged]);

  const submitComment = async () => {
    const content = newCommentRef.current.value;
    if (content.length == 0) {
      return;
    }

    await postApi.addComment(postId, content);
    setDataChanged(true);
  }

  const likePost = async () => {
    await postApi.like(postId);
    setDataChanged(true);
  }

  const unlikePost = async () => {
    await postApi.unlike(postId);
    setDataChanged(true);
  }

  const likeComment = async (commentId) => {
    await postApi.likeComment(commentId);
    setDataChanged(true);
  }

  const unlikeComment = async (commentId) => {
    await postApi.unlikeComment(commentId);
    setDataChanged(true);
  }

  return (
    <div>
      {loadedPost !== null ?
        <div className="flex flex-col">
          <ListingInfo
            postId={postId}
            title={loadedPost.title}
            author={loadedPost.author}
            licence={loadedPost.licence}
            likes={loadedPost.likes}
            tags={loadedPost.tags}
            likePost={likePost}
            unlikePost={unlikePost}
            likedThisPost={likedThisPost} />

          <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
            <textarea ref={newCommentRef} className="w-full h-12 resize-y border rounded-md p-2 max-h-32" placeholder="Add a comment..."></textarea>
            <button className="max-w-third mx-auto" onClick={submitComment}>Comment</button>
          </div>

          <div className="max-h-80 overflow-auto divide-y">
            {
              loadedPost.comments.map(c =>
                <Comment
                  commentId={c.comment_id}
                  author={c.author}
                  content={c.content}
                  likes={c.likes}
                  likeComment={likeComment}
                  unlikeComment={unlikeComment}
                  likedComments={likedComments} />
              )
            }
          </div>

          <div className="flex justify-center">
            <Link to="#">More like this...</Link> {/* TODO: Link to an appropriate search. */}
          </div>
        </div>
        :
        ""}
    </div>
  );
};

export default Listing;
