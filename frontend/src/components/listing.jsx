import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

import * as postApi from './../api/post.js';
import * as commentApi from './../api/comment.js';
import toast from 'react-hot-toast';

const Listing = ({ postId }) => {
  const [loadedPost, setLoadedPost] = useState(null);
  const [likedThisPost, setLikedThisPost] = useState(false);
  const [likedComments, setLikedComments] = useState([]);
  const [dataChanged, setDataChanged] = useState(false);

  const newCommentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await postApi.search({ post_id: postId });
        const post = posts[0];

        if (!post) {
          console.error("Failed to retrieve post data.");
          return;
        }

        if (localStorage.getItem('user') !== null) {
          const likedPosts = await postApi.likedBy();
          if (!likedPosts) {
            console.error("Failed to retrieve liked posts.");
            return;
          }
          setLikedThisPost(likedPosts.map(p => p.post_id).includes(postId));

          const likedComments = await commentApi.likedBy();
          if (!likedComments) {
            console.error("Failed to retrieve liked comments.");
            return;
          }
          setLikedComments(likedComments);
        }

        setLoadedPost(post);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    setDataChanged(false);
  }, [postId, dataChanged]);

  const submitComment = async () => {
    const content = newCommentRef.current.value;
    if (content.length === 0) {
      return;
    }

    await commentApi.addComment(postId, content);
    
    newCommentRef.current.value = "";
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
    await commentApi.likeComment(commentId);
    setDataChanged(true);
  }

  const unlikeComment = async (commentId) => {
    await commentApi.unlikeComment(commentId);
    setDataChanged(true);
  }

  const deleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete your comment?")) {
      return;
    }

    try {
      await commentApi.deleteComment(commentId);
      toast.success("Comment deleted");
      
      setDataChanged(true);
    } catch(err) {
      toast.error(`${err}`);
    }
  }

  const setTags = async (newTags) => {
    await postApi.edit(postId, {tags: newTags});
    setDataChanged(true);
  }

  const setLicence = async (newLicence) => {
    await postApi.edit(postId, {licence: newLicence});
    setDataChanged(true);
  }

  const toggleVisible = async () => {
    if (!(loadedPost?.is_hidden === 0 || loadedPost?.is_hidden === 1)) {
      toast.error('Error: Could not hide post.');
      return;
    }

    try {
      if (loadedPost.is_hidden === 0) {
        await postApi.hide(loadedPost.post_id);
        toast.success('Post has been hidden.');
      } else {
        await postApi.unhide(loadedPost.post_id);
        toast.success('Post has been made visible.');
      }
      setDataChanged(true);
    } catch (error) {
      console.error(error);
      toast.error('Error: Could not hide post.');
    }
  }

  const toggleCommentVisible = async (commentId) => {
    const comment = loadedPost.comments.find((c) => c.comment_id === commentId);
    if (comment === undefined) {
      toast.error('Error: Could not hide post.');
      return;
    }

    try {
      if (comment.is_hidden === 1) {
        await commentApi.unhideComment(commentId);
        toast.success('Successfully made comment visible.');
      } else {
        await commentApi.hideComment(commentId);
        toast.success('Successfully hid comment.');
      }
      setDataChanged(true);
    } catch (e) {
      console.error(e);
      toast.error('Error: Could not hide post.');
    }
  };

  return (
    <div>
      {loadedPost !== null ?
        <div className="flex flex-col max-w-xl px-3">
          <ListingInfo
            postId={postId}
            title={loadedPost.title}
            author={loadedPost.author}
            licence={loadedPost.licence}
            likes={loadedPost.likes}
            tags={loadedPost.tags}
            likePost={likePost}
            unlikePost={unlikePost}
            likedThisPost={likedThisPost}
            setTags={setTags}
            setLicence={setLicence}
            isVisible={loadedPost.is_hidden === 0}
            toggleVisible={toggleVisible}
          />

          <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
            <textarea ref={newCommentRef} className="w-full h-12 resize-y border rounded-md p-2 max-h-32" placeholder="Add a comment..."></textarea>
            <button className="max-w-third mx-auto" onClick={submitComment}>Comment</button>
          </div>

          <div className="max-h-60 overflow-auto divide-y">
            {loadedPost.comments && loadedPost.comments.map(c =>
              <Comment
                key={c.comment_id}
                commentId={c.comment_id}
                author={c.author}
                content={c.content}
                likes={c.likes}
                likeComment={likeComment}
                unlikeComment={unlikeComment}
                deleteComment={deleteComment}
                likedComments={likedComments}
                visible={c.is_hidden === 0}
                toggleVisible={() => toggleCommentVisible(c.comment_id)}
                isAdmin={localStorage.getItem('admin') === 'true'}
                isAuthor={localStorage.getItem('user') === c.author}
              />
            )}
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
