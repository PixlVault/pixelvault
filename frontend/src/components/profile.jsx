import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, } from 'react-router-dom';
import Api from '../api';
import { userImageBase, defaultImageUrl } from '../api/account/';
// import Tile from './tile';
import Popup from './popup';
import Listing from './listing';
import ProfileOptions from './profile-options';
import toast from 'react-hot-toast';
import { postImageBase } from '../api/post';

const Tile = ({ post, clickHandler }) => (
  <div className='border rounded relative w-full h-auto aspect-square' onClick={clickHandler}>
      <img className="pixelated w-full min-w-[256px] h-auto aspect-square object-cover rounded-lg" src={`${postImageBase}${post.post_id}.png`} alt="" />
      <div className="rounded-lg opacity-0 hover:bg-black/50 hover:opacity-100 duration-300 flex justify-normal items-end absolute inset-0 z-10  text-2xl text-white font-semibold">
      <p className='mx-2 mb-1 truncate'>{post.title}</p>
      </div>
  </div>
);

const Profile = () => {
  const params = useParams();

  const loggedInUser = localStorage.getItem('user');
  const userIsAdmin = localStorage.getItem('admin') === 'true';

  const navigate = useNavigate();

  const [selectedPost, setSelectedPost] = useState(null);
  const [listingOpen, setListingOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [profile, setProfile] = useState({});
  useEffect(() => {
    Api.account.get(params.username)
      .then((user) => setProfile(user))
      .catch((e) => console.error(e));
  }, [navigate, params.username]);
  const [isBanned, setIsBanned] = useState(profile?.is_banned === 1);

  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    if (loggedInUser !== null) {
      Api.account.following(loggedInUser)
        .then((followList) => {
          setIsFollowing(followList.includes(params.username));
        })
        .catch((e) => console.error(e));
    }
  }, [loggedInUser, params.username]);

  const [mostLiked, setMostLiked] = useState([]);
  const [newest, setNewest] = useState([]);

  useEffect(() => {
    if (params.username === undefined) return;
    Api.post.search({ author: params.username, order_by: 'likes', ascending: false, limit: 5})
      .then((posts) => setMostLiked(posts))
      .catch((error) => console.error(error));

    Api.post.search({ author: params.username, limit: 5, ascending: false })
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

  const ban = async () => {
    if (profile.username === undefined) {
      toast.error('Could not ban user; invalid username provided.');
      return;
    }

    const proceed = confirm(`Are you sure you want to ban '${profile.username}'?`);
    if (proceed) {
      try {
        await Api.account.ban(profile.username);
        toast.success(`User ${profile.username} successfully banned.`);
        setIsBanned(true);
      } catch (error) {
        console.error(error);
        toast.error('Error: Could not ban user');
      }
    }
  };

  const unban = async () => {
    if (profile.username === undefined) {
      toast.error('Could not unban user; invalid username provided.');
      return;
    }

    const proceed = confirm(`Are you sure you want to unban '${profile.username}'?`);
    if (proceed) {
      try {
        await Api.account.unban(profile.username);
        toast.success(`User ${profile.username} successfully unbanned.`);
        setIsBanned(false);
      } catch (error) {
        console.error(error);
        toast.error('Error: Could not unban user');
      }
    }
  };

  return (
    <div className='mt-4 w-full md:w-1/2 2xl:w-1/3 mx-auto'>
      <div className='flex mx-auto mb-4'>
        <div>
          <img
            /* TODO: Only specific sizes work here and it's not clear as to why;
               establish a better definite size. */
            className='aspect-square object-cover rounded w-[100px] min-w-[100px] mr-4'
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
              {
                // eslint-disable-next-line no-nested-ternary
                userIsAdmin
                  ? (isBanned
                    ? <button className="ml-2 bg-red-600 hover:bg-red-700" onClick={unban}>Unban</button>
                    : <button className="ml-2 bg-red-600 hover:bg-red-700" onClick={ban}>Ban</button>)
                  : <button className="ml-2 bg-red-600 hover:bg-red-700" onClick={() => navigate('/report')}>Report</button>
              }
            </div>
          </div>
          <div>
            <p className='text-wrap break-words'>
              {profile.biography === null || profile?.biography?.length === 0 ? 'This user has provided no biography.' : profile.biography}
            </p>
          </div>
          {
            profile.tiktok
              ?
                <div className='p-1 flex flex-row'>
                  <img
                    src='../tiktok.png'
                    className='rounded w-[30px] min-w-[30px] mr-4'
                  />
                  <a href= {`https://www.tiktok.com/@${profile.tiktok}`} >{profile.tiktok === null ? '' : `tiktok.com/@${profile.tiktok}`}</a>
                </div>
              : null
          }
          {
            profile.youtube
              ?
          <div className='p-1 flex flex-row'>
            <img
              src='../youtube.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.youtube.com/@${profile.youtube}`} >{profile.youtube === null ? '' : `youtube.com/@${profile.youtube}`}</a>
          </div>
              : null
          }
          {
            profile.instagram
              ?
          <div className='p-1 flex flex-row'>
            <img
              src='../instagram.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.instagram.com/${profile.instagram}`}>{profile.instagram === null ? '' : `instagram.com/${profile.instagram}`}</a>
          </div>
              : null
          }
          {
            profile.twitter
              ?
          <div className='p-1 flex flex-row'>
            <img
              src='../twitter.png'
              className='rounded w-[30px] min-w-[30px] mr-4'
            />
            <a href= {`https://www.x.com/${profile.twitter}`}>{profile.twitter === null ? '' : `x.com/${profile.twitter}`}</a>
          </div>
              : null
        }
        </div>
      </div>

      <hr></hr>

      <div className='flex flex-col justify-center my-4'>
        <h2 className="text-xl text-center">Most Recent</h2>
        <div className='flex flex-col lg:flex-row justify-center my-4'>
          {
            newest.map((post) => <div className='m-2 aspect-square' key={post.post_id}>
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
        <div className='flex flex-col lg:flex-row justify-center my-4'>
          {
            mostLiked.map((post) => <div className='m-2 aspect-square' key={post.post_id}>
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
              <Listing postId={selectedPost} closeListing={() => setPopupOpen(false)} />
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
