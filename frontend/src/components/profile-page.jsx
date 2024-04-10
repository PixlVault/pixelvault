import { useParams } from 'react-router-dom';

import { uploadProfilePicture, userImageBase } from '../api/account';

const ProfilePage = () => {
  const params = useParams();

  const uploadImage = async (e) => {
    e.preventDefault();
    const image = e.target.files[0];
    if (!image) return;

    const formData = new FormData();
    formData.append('avatar', image);
    await uploadProfilePicture(formData);
  };

  return (
    <div>
      Profile Page.
      <div>
        <img src={`${userImageBase}${params.username}.png`}></img>
        <label className='rounded border hover:cursor-pointer'>
          Upload a new Profile Picture
          <input type='file' className='hidden' onChange={uploadImage} name='avatar' />
        </label>
      </div>
    </div>
  );
};

export default ProfilePage;
