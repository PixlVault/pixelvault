import React, { useState, useRef } from 'react';

import Dropdown from './dropdown';

import * as post from '../api/post';
import textToTags from '../utils/tags';

const NewListing = ({ publish }) => {
  const [licence, setLicence] = useState(post.Licence.CreativeCommons);
  const tagsTextAreaRef = useRef(null);

  return (
    <div>
      <div className='mx-4 mb-4 flex flex-col gap-4 py-2'>
        <div className="space-y-2 text-center">
          <div className="font-bold">Licence</div>
          <Dropdown title={licence}>
            <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setLicence(post.Licence.CreativeCommons)}>{post.Licence.CreativeCommons}</div>
            <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setLicence(post.Licence.Commercial)}>{post.Licence.Commercial}</div>
            <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setLicence(post.Licence.Education)}>{post.Licence.Education}</div>
          </Dropdown>
        </div>

        <div className="flex flex-col space-y-2 text-center">
          <div className="font-bold">Tags</div>
          <textarea ref={tagsTextAreaRef} placeholder="#tag1 #tag2 #tag3"></textarea>
          <div className="text-sm"></div>
        </div>

        <div className="flex justify-center space-x-5">
          <button onClick={async () => await publish(licence, textToTags(tagsTextAreaRef.current.value))}>Publish</button>
        </div>
      </div>
    </div>
  );
};

export default NewListing;
