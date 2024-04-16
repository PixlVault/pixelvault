import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import Api from '../api';
import { uploadProfilePicture, userImageBase, defaultImageUrl } from '../api/account';

const BIOGRAPHY_LIMIT = 255;

const ProfileOptiions = ({ profile }) => {
  const [imageToggle, setImageToggle] = useState(Date.now());
  const refreshImage = () => setImageToggle(Date.now());

  const [biography, setBiography] = useState(profile.biography === null ? '' : profile.biography);
  const [newPassword, setNewPassword] = useState('');
  const [newTwitter, setNewTwitter] = useState('');
  const [newInstagram, setNewInstagram] = useState('');
  const [newTikTok, setNewTikTok] = useState('');
  const [newYoutube, setNewYoutube] = useState('');

  const update = (updates, successMessage) => {
    console.log('doing');
    Api.account.update(profile.username, updates)
      .then(() => toast.success(successMessage))
      .catch((e) => {
        toast.error('Failed to save details.');
        console.error(e);
      });
  };

  const saveBio = (e) => {
    e.preventDefault();
    if (biography.length > BIOGRAPHY_LIMIT) {
      toast.error(`Biography must be under ${BIOGRAPHY_LIMIT + 1} characters.`);
    } else {
      update({ biography }, 'Successfully updated biography.');
    }
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
    } else {
      update({ password: newPassword }, 'Successfully changed password.');
    }
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    const image = e.target.files[0];
    if (!image) return;

    const formData = new FormData();
    formData.append('avatar', image);
    const success = await uploadProfilePicture(formData, profile.username);
    if (!success) toast.error('Upload Failed, please try again');
    else toast.success('Updated profile picture');
    refreshImage();
  };

  const saveHandles = (e) => {
    e.preventDefault();
    if (newYoutube && (newYoutube.length < 31)) {
      update({ youtube: newYoutube }, 'Successfully set Youtube.');
    }
    if (newTwitter && (newTwitter.length < 16)) {
      update({ twitter: newTwitter }, 'Successfully set X.');
    }
    if (newInstagram && (newInstagram.length < 31)) {
      update({ instagram: newInstagram }, 'Successfully set Instagram.');
    }
    if (newTikTok && (newTikTok.length < 25)) {
      update({ tiktok: newTikTok }, 'Successfully set TikTok.');
    }
  };

  const fileInput = useRef();

  return (
    <div className='w-full'>
      <div className='mx-4 mb-4 gap-4'>
        <div className='flex flex-col items-center'>
          <label htmlFor='file-upload' className='font-semibold'>
            Avatar
          </label>
          <div className='relative' onClick={() => fileInput.current.click()}>
            <img
              className='rounded w-[100px] min-w-[100px]'
              src={`${userImageBase}${profile.username}.png?r=${imageToggle}`}
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

        <div>
          <form>
            <label htmlFor='biography-entry' className='block font-semibold'>
              Biography
            </label>
            <div>
              <textarea value={biography} className='resize-none h-24 p-1 w-96' id='biography-entry' onChange={(e) => setBiography(e.target.value)}></textarea>
              <div className='flex'>
                <span className='mr-auto mt-2 max-h-8'>{biography.length}/255</span>
                <button className='block ml-auto mt-2 max-h-8' type='submit' onClick={saveBio}>Save</button>
              </div>
            </div>
          </form>
          <form>
            <label htmlFor='password-entry' className='block font-semibold'>
              Set New Password
            </label>
            <div className='flex gap-2 items-center shrink-0 grow-0'>
              <input id='password-entry' className='w-full py-1' type='password' onChange={(e) => setNewPassword(e.target.value)}></input>
              <button className='max-h-8' type='submit' onClick={savePassword}>Save</button>
            </div>
          </form>
          <div className="flex py-5 items-center">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="flex-shrink mx-4 text-gray-400">Social Media</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>
          <form className='grid gap-1 mb-2 md:grid-cols-1'>
            <label htmlFor='youtube' className='block font-semibold'>
              YouTube:
            </label>
              <input id='youtube' className='w-full py-1' onChange={(e) => setNewYoutube(e.target.value)}></input>
            <label htmlFor='x' className='block font-semibold'>
              X:
            </label>
              <input id='x' className='w-full py-1' onChange={(e) => setNewTwitter(e.target.value)}></input>
            <label htmlFor='instagram' className='block font-semibold'>
              Instagram:
            </label>
              <input id='instagram' className='w-full py-1' onChange={(e) => setNewInstagram(e.target.value)}></input>
            <label htmlFor='tiktok' className='block font-semibold'>
              TikTok:
            </label>
              <input id='tiktok' className='w-full py-1' onChange={(e) => setNewTikTok(e.target.value)}></input>
          </form>
          <button className='max-h-8' type='submit' onClick={saveHandles}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOptiions;

// <button className='max-h-8' type='submit' onClick={savePassword}>Save</button>
