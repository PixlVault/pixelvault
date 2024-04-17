import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userImageBase, defaultImageUrl } from '../api/account';

const Comment = ({ commentId, author, content, likes, likeComment, unlikeComment, deleteComment, likedComments, isAdmin, visible, toggleVisible, isAuthor }) => {
  const likedThisComment = likedComments.map(c => c.comment_id).includes(commentId);

  const imgClass = 'w-4 h-4 space-x-0 hover:cursor-pointer inline-block align-middle'

  return (
    <div className="flex flex-row w-full justify-center items-center my-2 px-5">
      <img
        className='aspect-square object-cover min-w-12 max-w-12 h-auto mr-2 rounded-full'
        src={`${userImageBase}${author}.png`}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = defaultImageUrl;
        }}
      />
      <div className="flex w-full items-stretch justify-center items-center">
        <div className="grow flex flex-col">
          <div className='text-left block'>
            <Link to={`/profile/${author}`} className="font-bold">{author}</Link>
          </div>
          <div className="flex w-full">
            <p className="text-wrap break-words max-w-80 text-left">{content}</p>
          </div>
        </div>
        <div className="flex flex-row space-x-5 justify-center items-center">
          <div className="flex flex-row space-x-1 justify-center items-center">
            <div className="flex items-center">
              {
                likedThisComment ?
                  <img className={imgClass} src="/pixelartheart.png" onClick={() => unlikeComment(commentId)} />
                  :
                  <img className={imgClass} src="/pixelartheart_empty.png" onClick={() => likeComment(commentId)} />
              }
            </div>
            <div className="flex items-center">{likes}</div>
            {
              isAdmin === true
                ? <img className={imgClass} src={visible ? '/visible.png' : '/hidden.png'} onClick={() => toggleVisible(commentId)} />
                :
                isAuthor === true
                  ? <img className={imgClass} src='/bin.png' onClick={async () => await deleteComment(commentId)} />
                  : <img className={imgClass} src='/report.png' onClick={() => console.log('TODO: Report')} />
            }
          </div>
        </div>
      </div>

    </div>
  );
};

export default Comment;
