import React, { useEffect, useState } from 'react';
import {
  Link, Navigate, useNavigate, useParams,
} from 'react-router-dom';
import Api from '../api';
import { userImageBase, defaultImageUrl } from '../api/account/';
import Tile from './tile';
import Popup from './popup';
import Listing from './listing';
import ProfileOptions from './profile-options';

const Profile = () => {
  const loggedInUser = localStorage.getItem('user');
  const navigate = useNavigate();
  const params = useParams();

  const [selectedPost, setSelectedPost] = useState(null);
  const [listingOpen, setListingOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [profile, setProfile] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);

  const [mostLiked, setMostLiked] = useState([]);
  const [newest, setNewest] = useState([]);

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

  useEffect(() => {
    if (params.username === undefined) return;
    Api.post.search({ author: params.username, order_by: 'likes', ascending: false, limit: 5})
      .then((posts) => setMostLiked(posts))
      .catch((error) => console.error(error));

    Api.post.search({ author: params.username, limit: 5})
      .then((posts) => setNewest(posts))
      .catch((error) => console.error(error));
  }, [params]);

  const follow = () => {
    Api.account.follow(loggedInUser, params.username)
      .then(() => {
        setIsFollowing(true);
        profile.followers += 1;
      })
      .catch((e) => console.error(e));
  };

  const unfollow = () => {
    Api.account.unfollow(loggedInUser, params.username)
      .then(() => {
        setIsFollowing(false);
        profile.followers -= 1;
      })
      .catch((e) => console.error(e));
  };

  const FollowButton = () => {
    if (params.username === loggedInUser) {
      return <button onClick={() => setOptionsOpen(true)}>Options</button>;
    }

    return (
      !isFollowing
        ? <button onClick={follow}>Follow</button>
        : <button onClick={unfollow}>Unfollow</button>
    );
  };

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setListingOpen(true);
  };

  return (
    <div className='mt-4 w-full md:w-1/2 2xl:w-1/3 mx-auto'>
      <div className='flex mx-auto mb-4'>
        <div>
          <img
            /* TODO: Only specific sizes work here and it's not clear as to why;
               establish a better definite size. */
            className='rounded w-[100px] min-w-[100px] mr-4'
            src={`${userImageBase}${params.username}.png`}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = defaultImageUrl;
            }}
          />
        </div>
        <div className='w-full'>
          <div id='profile-summary' className='flex'>
            <div>
              <h1 className='text-3xl font-semibold' >{profile.username}</h1>
              <span className='text-xl'>Followers: {profile.followers || 0}</span>
            </div>
            <div className=' ml-auto max-h-10 justify-end'>
              <FollowButton />
              <button className="bg-red-500" onClick={() => navigate('/report')}>Report</button>
            </div>
          </div>
          <div>
            <p className='text-wrap break-words'>{profile.biography === null ? 'This user has provided no biography.' : profile.biography}</p>
          </div>

          <div className='p-1 flex flex-row'>
            <img
              src='../tiktok.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.tiktok.com/@${profile.tiktok}`} >{profile.tiktok === null ? '' : `tiktok.com/@${profile.tiktok}`}</a>
          </div>

          <div className='p-1 flex flex-row'>
            <img
              src='../youtube.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.youtube.com/@${profile.youtube}`} >{profile.youtube === null ? '' : `youtube.com/@${profile.youtube}`}</a>
          </div>

          <div className='p-1 flex flex-row'>
            <img
              src='../instagram.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.instagram.com/${profile.instagram}`}>{profile.instagram === null ? '' : `instagram.com/${profile.instagram}`}</a>
          </div>
          <div className='p-1 flex flex-row'>
            <img
              src='../twitter.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.x.com/${profile.twitter}`}>{profile.twitter === null ? '' : `x.com/${profile.twitter}`}</a>
          </div>
        </div>
      </div>

      <hr></hr>

      <div className='flex flex-col justify-center my-4'>
        <h2 className="text-xl text-center">Most Recent</h2>
        <div className='flex flex-col md:flex-row justify-center my-4'>
          {
            newest.map((post) => <div className='m-2 max-w-6/12 aspect-square' key={post.post_id}>
              <Tile post={post} clickHandler={() => openPopup(post.post_id)} />
            </div>)
          }
        </div>
        <button className='mx-auto' onClick={() => navigate(
          `/search?author=${params.username}`,
        )}>See More</button>
      </div>

      <hr></hr>

      <div className='flex flex-col justify-center my-4'>
        <h2 className="text-xl text-center">Most Liked</h2>
        <div className='flex flex-col md:flex-row justify-center my-4'>
          {
            mostLiked.map((post) => <div className='m-2 max-w-6/12 aspect-square' key={post.post_id}>
              <Tile post={post} clickHandler={() => openPopup(post.post_id)} />
            </div>)
          }
        </div>
        <button className='mx-auto' onClick={() => navigate(
          `/search?author=${params.username}&order_by=likes&ascending=false`,
        )}>See More</button>
      </div>

      {
        listingOpen
          ? <Popup onClose={() => setListingOpen(false)}>
              <Listing postId={selectedPost} />
            </Popup>
          : null
      }

      {
        optionsOpen && (loggedInUser === params.username)
          ? <Popup title='Options' onClose={() => setOptionsOpen(false)}>
              <ProfileOptions profile={profile} />
            </Popup>
          : null
      }
    </div>
  );
};

export default Profile;
