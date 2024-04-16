import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { search } from '../api/post';
import Listing from './listing.jsx';
import Popup from './popup.jsx';
import { postImageBase } from '../api/post';
import SearchBar from './searchBar.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [mostLikedProjects, setMostLikedProjects] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMostLikedProjects = async () => {
      try {
        const posts = await search({ order_by: 'likes', limit: 5 });
        if (!posts) {
          console.error("Failed to retrieve most liked post data.");
          return;
        }
        const reversedPosts = posts.reverse();
        setMostLikedProjects(reversedPosts);
      } catch (error) {
        console.error("Error fetching most liked projects:", error);
      }
    };

    const fetchRecentPosts = async () => {
      try {
        const posts = await search({ limit: 5 });
        if (!posts) {
          console.error("Failed to retrieve recent post data.");
          return;
        }
        const reversedPosts = posts.reverse();
        setRecentPosts(reversedPosts);
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      }
    };

    fetchMostLikedProjects();
    fetchRecentPosts();
  }, []);

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true);
  };

  const handleSeeMoreRecent = () => {
    navigate('/search?order_by=published_on&ascending=false'); // Navigate to search page with order_by set to 'published_on'
  };

  const handleSeeMoreMostLiked = () => {
    navigate('/search?order_by=likes&ascending=false');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 w-6/12"> {/* Padding based on screen size */}
      <h2 className="text-center text-2xl font-bold mb-4">Gallery</h2>
      <SearchBar />

      <div className="flex flex-col md:flex-row justify-center overflow-x-auto border-b border-gray-200 pb-4">
        {/* Use flex-col for small screens and flex-row for medium and larger screens */}
        {mostLikedProjects.map((project, index) => (
          <div key={project.post_id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-3/12' : 'w-2/12'} flex flex-col justify-center items-center`}>
            {/* Use 1/5 width for medium and larger screens */}
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Most Liked</div>}
            <img
              src={`${postImageBase}${project.post_id}.png`}
              className={`w-full h-auto aspect-square object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'} border border-gray-300 ${index === 0 ? 'border-blue-500' : ''}`}
              onClick={() => openPopup(project.post_id)}
              alt={`Image ${index + 1}`}
            />
            <div className="text-xs text-gray-600">{project.title}</div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center ml-4">
          <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <Link to="/search?order_by=likes&ascending=false" className="text-sm text-gray-600 cursor-pointer">See more</Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center overflow-x-auto pb-4">
        {/* Use flex-col for small screens and flex-row for medium and larger screens */}
        {recentPosts.map((project, index) => (
          <div key={project.post_id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-3/12' : 'w-2/12'} flex flex-col justify-center items-center`}>
            {/* Use 1/5 width for medium and larger screens */}
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Recent</div>}
            <img
              src={`${postImageBase}${project.post_id}.png`}
              className={`w-full h-auto aspect-square object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'} border border-gray-300 ${index === 0 ? 'border-green-500' : ''}`}
              onClick={() => openPopup(project.post_id)}
              alt={`Image ${index + 1}`}
            />
            <div className="text-xs text-gray-600">{project.title}</div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center ml-4">
          <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <Link to="/search?order_by=published_on&ascending=false" className="text-sm text-gray-600 cursor-pointer">See more</Link>
        </div>
      </div>

      {popupOpen && (
        <Popup onClose={() => setPopupOpen(false)}>
          <Listing postId={selectedPost} />
        </Popup>
      )}
    </div>
  );
};

export default ExplorePage;
