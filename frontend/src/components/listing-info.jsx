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
  setTags, setLicence, isVisible, toggleVisible
}) => {
  const [editingTags, setEditingTags] = useState(false);
  const tagsTextAreaRef = useRef(null);
  const isOwner = author == localStorage.getItem('user');
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
        <img className="pixelated w-48 h-48 border  border-gray-300" src={`${postImageBase}${postId}.png`} />
        <button onClick={download} className='mt-2 mb-4'>Download</button>
      </div>
      <div>
        <div className="h-full grid grid-flow-row-dense grid-cols-2 grid-rows-3">
          <div className="flex flex-col justify-center items-center">
            <div className="flex space-x-3">
              <div className="flex flex-col justify-center items-center">
                <h2 title={title} className="text-xl font-bold truncate max-w-40">{title}</h2>
                <h4><Link to={`/profile/${author}`}>{author}</Link></h4>
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
                isOwner ?
                  <Dropdown titleElement={<img className="w-3 h-3 hover:cursor-pointer" title="Edit Licence" src="/pencil.png" />}>
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
              isAdmin
              ? <button className="bg-red-600" onClick={toggleVisible}>{isVisible ? 'Hide' : 'Unhide'}</button>
              : <button className="bg-red-600">Report</button>
            
            }
            
          </div>
          <div className="flex flex-col col-span-2 space-y-2 max-h-[70px] px-4">
            <div className="flex">
              <div className="grow"></div>
              {
                editingTags ?
                  <div className="flex space-x-2">
                    <img className="w-3 h-3 hover:cursor-pointer" title="Confirm" src="/tick.png" onClick={confirmTags} />
                    <img className="w-3 h-3 hover:cursor-pointer" title="Cancel" src="/bin.png" onClick={() => setEditingTags(false)} />
                  </div>
                  :
                  isOwner ? <img className="w-3 h-3 hover:cursor-pointer" title="Edit Tags" src="/pencil.png" onClick={() => setEditingTags(true)} /> : ""
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
