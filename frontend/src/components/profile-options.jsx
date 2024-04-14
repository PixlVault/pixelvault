import { useParams } from 'react-router-dom';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { uploadProfilePicture, userImageBase, defaultImageUrl } from '../api/account';

const ProfileOptiions = () => {
  const params = useParams();

  const [imageToggle, setImageToggle] = useState(Date.now());
  const refreshImage = () => setImageToggle(Date.now());

  const uploadImage = async (e) => {
    e.preventDefault();
    const image = e.target.files[0];
    if (!image) return;

    const formData = new FormData();
    formData.append('avatar', image);
    const success = await uploadProfilePicture(formData, params.username);
    if (!success) toast.error('Upload Failed, please try again');
    refreshImage();
  };

  const fileInput = useRef();

  return (
    <div>
      <div className='mx-4 mb-4 flex gap-4'>
        <div className='flex flex-col items-center'>
          <label htmlFor='file-upload' className='font-semibold'>
            Avatar
          </label>
          <div className='relative' onClick={() => fileInput.current.click()}>
            <img
              className='rounded w-[100px] min-w-[100px]'
              src={`${userImageBase}${params.username}.png?r=${imageToggle}`}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = defaultImageUrl;
              }}
            />
            <div className="cursor-pointer rounded opacity-0 hover:bg-black/50 hover:opacity-100 duration-300 flex absolute inset-0 z-10 justify-center items-center text-lg text-white font-semibold">
              <span>Upload</span>
            </div>
          </div>
          <input ref={fileInput} id='file-upload' type='file' className='hidden' onChange={uploadImage} name='avatar' />
        </div>
        <div className='w-full'>
          <form>
            <label htmlFor='biography-entry' className='block font-semibold'>
              Biography
            </label>
            <div>
              <textarea className='resize-none h-24 py-1 w-96' id='biography-entry'></textarea>
              <button className='block ml-auto mt-2 max-h-8' type='submit'>Save</button>
            </div>
          </form>
          <form>
            <label htmlFor='password-entry' className='block font-semibold'>
              Set New Password
            </label>
            <div className='flex gap-2 items-center shrink-0 grow-0'>
              <input id='password-entry' className='w-full py-1' type='password'></input>
              <button className='max-h-8' type='submit'>Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileOptiions;
