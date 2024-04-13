import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Api from '../api';
import { userImageBase, defaultImageUrl } from '../api/account/';

const expandListings = (event) => {

};

const mailto = (event) => {

};

const tutorial = (event) => {

};

const terms = (event) => {

};

const Profile = () => {
  const loggedInUser = localStorage.getItem('user');
  const navigate = useNavigate();
  const params = useParams();

  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    Api.account.get(params.username)
      .then((user) => setProfile(user))
      .catch((e) => console.error(e));
  }, [params.username]);

  useEffect(() => {
    if (loggedInUser !== null) {
      Api.account.following(loggedInUser)
        .then((followList) => {
          console.log(followList, followList.includes(params.username));
          setIsFollowing(followList.includes(params.username));
        })
        .catch((e) => console.error(e));
    }
  }, [loggedInUser, params.username]);

  const follow = () => {
    Api.account.follow(loggedInUser, params.username)
      .then(() => setIsFollowing(true))
      .catch((e) => console.error(e));
  };

  const unfollow = () => {
    Api.account.unfollow(loggedInUser, params.username)
      .then(() => setIsFollowing(false))
      .catch((e) => console.error(e));
  };

  const FollowButton = () => {
    if (params.username === loggedInUser) return null;
    return (
      !isFollowing
        ? <div className="flex"><button className="text-white bg-grey w-auto h-auto mb-40" onClick={follow}>Follow</button></div>
        : <div className="flex"><button className="text-white bg-grey w-auto h-auto mb-40" onClick={unfollow}>Unfollow</button></div>
    );
  };

  return (
    <div>
    <h1 className="text-black mb-10 text-center text-4xl">{profile.username}</h1>
    <div className="bg-silver px-5 mx-auto">
        <div><h3 className="flex items-center justify-center text-2xl mb-10">Followers: {profile.followers || 0}</h3></div>
        <div className="flex items-center justify-center">
        <div>
          <img
            src={`${userImageBase}${params.username}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = defaultImageUrl;
            }}
          />
          <label htmlFor="level">L42</label>
          <progress id="level" value="32" max="100"></progress>
          <label htmlFor="level" className="mr-70">L43</label>
        </div>
          <div><p className="max-w-sm text-xl">{profile.biography === null ? 'This user has provided no bio.' : profile.biography }</p></div>
          <FollowButton />
          <div className="flex"><button className="text-white w-auto h-auto mb-40" style={{ backgroundColor: 'red' }} onClick = {() => navigate('/report')}>Report</button></div>
        </div>
    </div>

    <hr className="w-40 h-4 bg-grey mx-auto"></hr>

    <div className="w-40 bg-silver px-5 mx-auto">
        <div>
            <h4 className="text-xl"><u>User Listings</u></h4>
            <div className="seeAll"><button className="text-white bg-grey w-auto h-auto ml-80" onClick = {() => navigate('/search')}>See all...</button></div>
        </div>
        <div className="flex h-auto w-auto mt-20">
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="listing1" className="limg1"/>
                </picture>
            </a>
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="listing2" className="limg2"/>
                </picture>
            </a>
        </div>

    </div>

    <hr className="endlisting"></hr>

    <div className="w-40 bg-silver px-5 mx-auto">
        <h5 className="text-black top-85 text-center text-xl"><u>Popular Posts</u></h5>
        <div className="flex mt-20">
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post1"/>
                </picture>
            </a>
            <a href="google.com">
                <picture>
                    <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post2"/>
                </picture>
            </a>
            </div>
            <div className="bottomimages">
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post3"/>
                    </picture>
                </a>
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post4"/>
                    </picture>
                </a>
                <a href="google.com">
                    <picture>
                        <img src="src/assets/Screenshot 2024-04-06 160835.jpg" alt="post5"/>
                    </picture>
                </a>
            </div>

    </div>

    </div>
  );
};

export default Profile;
