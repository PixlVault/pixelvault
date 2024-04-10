import { useState } from 'react';
import { uploadProfilePicture } from '../api/account';

const ProfilePage = () => {
  const [image, setImage] = useState(null);

  const uploadImage = async (e) => {
    e.preventDefault();

    if (image === null) return;

    const formData = new FormData();
    formData.append('avatar', image);

    await uploadProfilePicture(formData);
  };

  return (
    <div>
      Profile Page.
        <input type='file' onChange={(e) => setImage(e.target.files[0])} name='avatar' />
        <button onClick={uploadImage} >SEND</button>
    </div>
  );
};

export default ProfilePage;
