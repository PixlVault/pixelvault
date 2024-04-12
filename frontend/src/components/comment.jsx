import { useState, useEffect } from 'react';

const Comment = ({ commentId, author, content, likes, likeComment, unlikeComment, likedComments }) => {
  const likedThisComment = likedComments.map(c => c.comment_id).includes(commentId);

  return (
    <div className="flex flex-col w-full justify-center items-center px-5">
      <div className="flex w-full items-stretch">
        <div className="grow">
          <h6 className="font-bold">{author}</h6>
          <p>{content}</p>
        </div>
        <div className="flex flex-row space-x-5 justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <div>
              {
                likedThisComment ?
                  <img className="w-4 h-4 space-x-0 hover:cursor-pointer" src="pixelartheart.png" onClick={() => unlikeComment(commentId)} />
                  :
                  <img className="w-4 h-4 space-x-0 hover:cursor-pointer" src="pixelartheart_empty.png" onClick={() => likeComment(commentId)} />
              }
            </div>
            <div>{likes}</div>
          </div>
          <div>...</div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
