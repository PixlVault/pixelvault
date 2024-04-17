import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Comment = ({ commentId, author, content, likes, likeComment, unlikeComment, likedComments, isAdmin, visible, toggleVisible,  }) => {
  const likedThisComment = likedComments.map(c => c.comment_id).includes(commentId);

  const imgClass = 'w-4 h-4 space-x-0 hover:cursor-pointer inline-block align-middle'

  return (
    <div className="flex flex-col w-full justify-center items-center px-5">
      <div className="flex flex-row w-full items-stretch">
        <div className="text-left grow">
          <Link to={`/profile/${author}`} className="font-bold">{author}</Link>
        </div>
        <div className="flex flex-row space-x-5 justify-center items-center">
          <div className="flex flex-row space-x-1 justify-center items-center">
            <div>
              {
                likedThisComment ?
                  <img className={imgClass} src="/pixelartheart.png" onClick={() => unlikeComment(commentId)} />
                  :
                  <img className={imgClass} src="/pixelartheart_empty.png" onClick={() => likeComment(commentId)} />
              }
            </div>
            <div>{likes}</div>
              {
                isAdmin === true
                  ? <img className={imgClass} src={visible ? '/visible.png' : '/hidden.png'} onClick={() => toggleVisible(commentId)} />
                  : <img className={imgClass} src='/report.png' onClick={() => console.log('TODO: Report')} />
              }
            <div>...</div> {/* TODO: Get this to align in the middle*/}
          </div>
        </div>
      </div>

      <div className="flex w-full">
        <p className="text-wrap break-words max-w-80 text-left">{content}</p>
      </div>
    </div>
  );
};

export default Comment;
