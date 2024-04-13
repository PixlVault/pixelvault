import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '../api/post';
import Listing from './listing.jsx';
import Popup from './popup.jsx';
import * as postApi from './../api/post.js';
import { postImageBase } from '../api/post';

const ExplorePage = ({ user }) => {
  const navigate = useNavigate(); // Add this line
  const [popupOpen, setPopupOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadedPosts, setLoadedPosts] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const posts = await postApi.search({});
      if (posts === null || posts === undefined) {
        console.error("Failed to retrieve post data.");
        return;
      }

      setLoadedPosts(posts);
    }

    fetchData().catch(console.error);
  }, []);
  
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    // Perform search logic here
    // For now, just navigate to the search page
    navigate('/search');
  };
  
  const sampleProjectsSet1 = [
    { id: 1, imageUrl: 'https://i.postimg.cc/MHff2gYG/8-bit-graphics-pixels-scene-with-person-walking-dog-park.jpg', title: 'Title 1' },
    { id: 2, imageUrl: 'https://i.postimg.cc/c4J5YhLL/7392521.jpg', title: 'Title 2' },
    { id: 3, imageUrl: 'https://i.postimg.cc/8kfxntVX/7481714.jpg', title: 'Title 3' },
    { id: 4, imageUrl: 'https://i.postimg.cc/c4J5YhLL/7392521.jpg', title: 'Title 4' },
    { id: 5, imageUrl: 'https://i.postimg.cc/FRQFZ4zy/20240317-202042-1.jpg', title: 'Title 5' },
  ];

  const sampleProjectsSet2 = [
    { id: 6, imageUrl: 'https://i.postimg.cc/c4J5YhLL/7392521.jpg', title: 'Title 6' },
    { id: 7, imageUrl: 'https://i.postimg.cc/c4J5YhLL/7392521.jpg', title: 'Title 7' },
    { id: 8, imageUrl: 'https://i.postimg.cc/8kfxntVX/7481714.jpg', title: 'Title 8' },
    { id: 9, imageUrl: 'https://i.postimg.cc/Y2vtVQX7/images.jpg', title: 'Title 9' },
    { id: 10, imageUrl: 'https://i.postimg.cc/Y2vtVQX7/images.jpg', title: 'Title 10' },
  ];
  
  return (
    <div style={{ position: 'relative' }}> {/* Add this line */}
      <h2 className="text-center text-2xl font-bold mb-4">Gallery</h2>
      
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-4 border-b border-gray-200 pb-4 flex items-center justify-between" style={{ position: 'relative' }}> {/* Add this line */}
        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
          <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-white hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-blue-800">Search</button>
        </div>
        <button type="button" className="py-1 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 ml-4">Filter</button>
      </form>

      <div className="flex justify-center overflow-x-auto border-b border-gray-200 pb-4" style={{ position: 'relative' }}> {/* Add this line */}
        {sampleProjectsSet1.map((project, index) => (
          <div key={project.id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-40' : 'w-32'} flex flex-col justify-center items-center`}>
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Featured</div>}
            <img
              src={project.imageUrl}
              className={`w-full h-32 object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'}`}
              onClick={() => setPopupOpen(true)}
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

      <div className="flex justify-center overflow-x-auto pb-4" style={{ position: 'relative' }}> {/* Add this line */}
        {sampleProjectsSet2.map((project, index) => (
          <div key={project.id} className={`relative ${index === 0 ? 'p-2' : 'p-1'} ${index === 0 ? 'w-40' : 'w-32'} flex flex-col justify-center items-center`}>
            {index === 0 && <div className="absolute top-0 left-0 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-tr-lg">Featured</div>}
            <img
              src={project.imageUrl}
              className={`w-full h-32 object-cover cursor-pointer hover:opacity-75 ${index === 0 ? 'h-40' : 'h-32'}`}
              onClick={() => setPopupOpen(true)}
              alt={`Image ${index + 6}`}
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
          <Listing />
        </Popup>
      )}
    </div>
  );
};

export default ExplorePage;
