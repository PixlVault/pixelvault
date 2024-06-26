import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import toast from 'react-hot-toast';

import Dropdown from './dropdown';

import { postImageBase } from '../api/post';
import * as post from '../api/post';

import textToTags from '../utils/tags';
import React from 'react';

const ListingInfo = ({
  postId, title, author, licence, likes, tags, likePost, unlikePost, likedThisPost,
  setTitle, setTags, setLicence, isVisible, toggleVisible, deletePost
}) => {
  const [editingTags, setEditingTags] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const tagsTextAreaRef = useRef(null);
  const titleTextAreaRef = useRef(null);
  const loggedInUser = localStorage.getItem('user');
  const isOwner = author == loggedInUser;
  const isAdmin = localStorage.getItem('admin') === 'true';

  if (tags != null) {
    var tagRows = [];
    const tagsPerRow = 3;
    for (let i = 0; i < tags.length; i += 3) {
      tagRows.push(tags.slice(i, i + tagsPerRow));
    }
  }

  const tagsToString = (tags) => {
    return tags.reduce((acc, tag) => acc += `#${tag} `, "");
  }

  const confirmTitle = async () => {
    var title = titleTextAreaRef.current.value;

    try {
      await setTitle(title);
      toast.success("Title changed");
    } catch (err) {
      toast.error(`${err}`);
    }

    setEditingTitle(false);
  }

  const confirmTags = async () => {
    var tags = textToTags(tagsTextAreaRef.current.value);

    try {
      await setTags(tags);
      toast.success("Tags changed");
    } catch (err) {
      toast.error(`${err}`);
    }

    setEditingTags(false);
  }

  const confirmLicence = async (newLicence) => {
    try {
      await setLicence(newLicence);
      toast.success("Licence changed");
    } catch (err) {
      toast.error(`${err}`);
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = `${postImageBase}${postId}.png`;
    link.download = `${title}.png`;
    link.click();
    link.remove();
  };

  return (
    <div className="w-full h-full grid grid-flow-row-dense grid-cols-2 grid-rows-1">
      <div className="flex flex-col justify-center items-center">
        <img className="pixelated w-48 h-48 border border-gray-300" src={`${postImageBase}${postId}.png`} />
        <button onClick={download} className='mt-2 mb-4'>Download</button>
      </div>
      <div>
        <div className="h-full grid grid-flow-row-dense grid-cols-2 grid-rows-3">
          <div className="flex flex-col justify-center items-center">
            <div className="flex space-x-3">
              <div className="flex flex-col space-y-1  justify-center items-center">
                <div className="flex">
                  {
                    editingTitle ?
                      <div className="flex space-x-2">
                        <img className="w-3 h-3 hover:cursor-pointer" title="Confirm" src="/tick.png" onClick={confirmTitle} />
                        <img className="w-3 h-3 hover:cursor-pointer" title="Cancel" src="/bin.png" onClick={() => setEditingTitle(false)} />
                      </div>
                      :
                      isOwner ? <img className="w-3 h-3 hover:cursor-pointer" title="Edit Title" src="/pencil.png" onClick={() => setEditingTitle(true)} />
                        : ""
                  }
                </div>

                <div className="justify-center items-center text-center">
                  {
                    editingTitle
                      ? <textarea className="max-h-8 rounded-md max-w-40" ref={titleTextAreaRef} defaultValue={title}></textarea>
                      : <h2 title={title} className="text-xl font-bold truncate max-w-40">{title}</h2>
                  }
                  <h4><Link to={`/profile/${author}`}>{author}</Link></h4>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            {
              likedThisPost ?
                <img className="w-12 hover:cursor-pointer" src="/pixelartheart.png" onClick={unlikePost} />
                :
                <img className="w-12 hover:cursor-pointer" src="/pixelartheart_empty.png" onClick={likePost} />
            }
            <h2 className="text-xl">{likes}</h2>
          </div>
          <div className="flex justify-center items-center text-center space-x-3">
            <div className="flex space-x-3">
              <Link to="#"><h4 className="hover:underline">{licence}</h4></Link>

              {
                isOwner
                  ? <Dropdown titleElement={<img className="w-3 h-3 hover:cursor-pointer" title="Edit Licence" src="/pencil.png" />}>
                    <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => confirmLicence(post.Licence.CreativeCommons)}>{post.Licence.CreativeCommons}</div>
                    <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => confirmLicence(post.Licence.Commercial)}>{post.Licence.Commercial}</div>
                    <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => confirmLicence(post.Licence.Education)}>{post.Licence.Education}</div>
                  </Dropdown>
                  : ""
              }

            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            {
              // eslint-disable-next-line no-nested-ternary
              isOwner
                ? <button className="bg-red-600 hover:bg-red-700" onClick={deletePost}>Delete</button>
                : isAdmin
                  ? <button className="bg-red-600 hover:bg-red-700" onClick={toggleVisible}>{isVisible ? 'Hide' : 'Unhide'}</button>
                  : loggedInUser != null
                    ? <button className="bg-red-600 hover:bg-red-700"><Link to="/report" state={{ postId: postId, postTitle: title }}>Report</Link></button>
                    : ""
            }
          </div>
          <div className="flex flex-col col-span-2 space-y-2 max-h-[70px] px-4">
            <div className="flex">
              <div className="grow"></div>
              {
                // eslint-disable-next-line no-nested-ternary
                editingTags
                  ? <div className="flex space-x-2">
                    <img className="w-3 h-3 hover:cursor-pointer" title="Confirm" src="/tick.png" onClick={confirmTags} />
                    <img className="w-3 h-3 hover:cursor-pointer" title="Cancel" src="/bin.png" onClick={() => setEditingTags(false)} />
                  </div>
                  : isOwner
                    ? <img className="w-3 h-3 hover:cursor-pointer" title="Edit Tags" src="/pencil.png" onClick={() => setEditingTags(true)} />
                    : ""
              }
            </div>

            {
              editingTags ?
                <textarea className="max-h-12 rounded-md" placeholder="#tag1 #tag2 #tag3" ref={tagsTextAreaRef} defaultValue={tagsToString(tags)}></textarea>
                :
                <div className="overflow-y-auto space-y-2">
                  {
                    tags != null ?
                      tagRows.map(row =>
                        <div className="flex w-full" key={row}>
                          {row.map(x =>
                            <div className="max-w-third min-w-xs truncate px-2 mx-auto bg-blue-300 text-center rounded-md" key={x}>
                              <Link to={`/search?tags=${[x]}`} title={x}>{x}</Link>
                            </div>
                          )}
                        </div>
                      )
                      : ""
                  }
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingInfo;
