import { useState, useEffect } from 'react';

const Comment = ({ commentId, author, content, likes, likeComment, unlikeComment, likedComments }) => {
  const likedThisComment = likedComments.map(c => c.comment_id).includes(commentId);

  return (
    <div className="flex flex-col w-full justify-center items-center px-5">
      <div className="flex flex-row w-full items-stretch">
        <div className="grow">
          <h6 className="font-bold">{author}</h6>
        </div>
        <div className="flex flex-row space-x-5 justify-center items-center">
          <div className="flex flex-row space-x-1 justify-center items-center">
            <div>
              {
                likedThisComment ?
                  <img className="w-4 h-4 space-x-0 hover:cursor-pointer inline-block align-middle" src="pixelartheart.png" onClick={() => unlikeComment(commentId)} />
                  :
                  <img className="w-4 h-4 space-x-0 hover:cursor-pointer inline-block align-middle" src="pixelartheart_empty.png" onClick={() => likeComment(commentId)} />
              }
            </div>
            <div>{likes}</div>
            <div>...</div> {/* TODO: Get this to align in the middle*/}
          </div>
        </div>
      </div>

      <div className="flex w-full">
        <p className="text-wrap break-words max-w-80">{content}</p>
      </div>
    </div>
  );
};

export default Comment;
