import React, { useState, useEffect } from 'react';
import { search } from '../api/post';
import Listing from './listing.jsx';
import Popup from './popup.jsx';
import * as postApi from './../api/post.js';
import { postImageBase } from '../api/post';
import SearchBar from './searchBar.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [mostLikedProjects, setMostLikedProjects] = useState([]);
  const [licensedProjects, setLicensedProjects] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchMostLikedProjects = async () => {
      const posts = await search({ order_by: 'likes', limit: 5 });
      if (!posts) {
        console.error("Failed to retrieve most liked post data.");
        return;
      }
      // Reverse the order to display most liked first
      const reversedPosts = posts.reverse();
      setMostLikedProjects(reversedPosts);
    };

    const fetchLicensedProjects = async () => {
      const posts = await search({ license: true, limit: 5 });
      if (!posts) {
        console.error("Failed to retrieve licensed post data.");
        return;
      }
      setLicensedProjects(posts);
    };

    fetchMostLikedProjects().catch(console.error);
    fetchLicensedProjects().catch(console.error);
  }, []);

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2 className="text-center text-2xl font-bold mb-4">Gallery</h2>
      <SearchBar />

      <div className="flex justify-center overflow-x-auto border-b border-gray-200 pb-4" style={{ position: 'relative' }}>
        {mostLikedProjects.map((project, index) => (
          <div key={project.post_id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-40' : 'w-32'} flex flex-col justify-center items-center`}>
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Most Liked</div>}
            <img
              src={`${postImageBase}${project.post_id}.png`}
              className={`w-full h-32 object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'} border border-gray-300 ${index === 0 ? 'border-blue-500' : ''}`}
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
          <div className="text-sm text-gray-600">See more</div>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto pb-4" style={{ position: 'relative' }}>
        {licensedProjects.map((project, index) => (
          <div key={project.post_id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-40' : 'w-32'} flex flex-col justify-center items-center`}>
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Licensed</div>}
            <img
              src={`${postImageBase}${project.post_id}.png`}
              className={`w-full h-32 object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'} border border-gray-300 ${index === 0 ? 'border-green-500' : ''}`}
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
          <div className="text-sm text-gray-600">See more</div>
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
