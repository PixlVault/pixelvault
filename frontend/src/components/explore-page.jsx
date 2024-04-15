import React, { useState, useEffect } from 'react';
import { search } from '../api/post';
import Listing from './listing.jsx';
import Popup from './popup.jsx';
import * as postApi from './../api/post.js';
import { postImageBase } from '../api/post';
import SearchBar from './searchBar.jsx';

const ExplorePage = () => {
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
      <SearchBar />

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
