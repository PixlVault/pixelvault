import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { uploadProfilePicture, userImageBase, defaultImageUrl } from '../api/account';

const ProfilePage = () => {
  const params = useParams();

  const [imageToggle, setImageToggle] = useState(Date.now());
  const refreshImage = () => setImageToggle(Date.now());

  const uploadImage = async (e) => {
    e.preventDefault();
    const image = e.target.files[0];
    if (!image) return;

    const formData = new FormData();
    formData.append('avatar', image);
    const success = await uploadProfilePicture(formData);
    if (!success) alert('Upload Failed, please try again');
    refreshImage();
  };

  return (
    <div>
      Profile Page.
      <div>
        PLACEHOLDER!
        <img
          src={`${userImageBase}${params.username}.png?r=${imageToggle}`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = defaultImageUrl;
          }}
        />
        <label className='rounded border hover:cursor-pointer'>
          Upload a new Profile Picture
          <input type='file' className='hidden' onChange={uploadImage} name='avatar' />
        </label>
      </div>
    </div>
  );
};

export default ProfilePage;
