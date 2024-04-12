import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Listing from './listing.jsx';
import Popup from './popup.jsx';
import * as postApi from './../api/post.js';
import { postImageBase } from '../api/post';

const ExplorePage = ({ user }) => {
  const [popupOpen, setPopupOpen] = useState(false);
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

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true)
  };

  const imagesSet1 = [
    'https://i.postimg.cc/Y2vtVQX7/images.jpg',
    'https://i.postimg.cc/Y2vtVQX7/images.jpg',

    'https://i.postimg.cc/Y2vtVQX7/images.jpg',
    'https://i.postimg.cc/Y2vtVQX7/images.jpg'
  ];

  const imagesSet2 = [
    'https://i.postimg.cc/Y2vtVQX7/images.jpg',
    'https://i.postimg.cc/Y2vtVQX7/images.jpg',
    'https://i.postimg.cc/Y2vtVQX7/images.jpg',
    'https://i.postimg.cc/Y2vtVQX7/images.jpg'
  ];

  const [highlightedIndexSet1, setHighlightedIndexSet1] = useState(null);
  const [highlightedIndexSet2, setHighlightedIndexSet2] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleClickSet1 = (index) => {
    setHighlightedIndexSet1(index);
  };

  const handleClickSet2 = (index) => {
    setHighlightedIndexSet2(index);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // You can perform search functionality here
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${searchQuery}`, { state: { title: searchQuery } });
    }
  };

  return (
    <div className="container mx-auto mt-4 text-center">
      <h2 className="text-3xl font-semibold mb-2">Gallery</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
          placeholder="Search..."
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-1"> {/* Adjusted gap between pictures */}
          {imagesSet1.map((image, index) => (
            <div
              key={index}
              className={`relative cursor-pointer ${highlightedIndexSet1 === index ? 'lg:w-32' : 'lg:w-24'}`}
              onClick={() => handleClickSet1(index)}
            >
              <img
                src={image}
                alt={`Image Set 1 - ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
              {highlightedIndexSet1 === index && (
                <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setHighlightedIndexSet1(Math.max(0, highlightedIndexSet1 - 1))}
            disabled={highlightedIndexSet1 === 0}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Prev Set 1
          </button>
          <button
            onClick={() => setHighlightedIndexSet1(Math.min(imagesSet1.length - 1, highlightedIndexSet1 + 1))}
            disabled={highlightedIndexSet1 === imagesSet1.length - 1}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Next Set 1
          </button>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-4 gap-1"> {/* Adjusted gap between pictures */}
          {imagesSet2.map((image, index) => (
            <div
              key={index}
              className={`relative cursor-pointer ${highlightedIndexSet2 === index ? 'lg:w-32' : 'lg:w-24'}`}
              onClick={() => handleClickSet2(index)}
            >
              <img
                src={image}
                alt={`Image Set 2 - ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
              {highlightedIndexSet2 === index && (
                <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setHighlightedIndexSet2(Math.max(0, highlightedIndexSet2 - 1))}
            disabled={highlightedIndexSet2 === 0}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Prev Set 2
          </button>
          <button
            onClick={() => setHighlightedIndexSet2(Math.min(imagesSet2.length - 1, highlightedIndexSet2 + 1))}
            disabled={highlightedIndexSet2 === imagesSet2.length - 1}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Next Set 2
          </button>
        </div>
      </div>
      
    <div>
      <div>Explore Page.</div>
      <img className="w-64 h-64 hover:cursor-pointer" src="sr25f64d3c492aws3.png" onClick={() => setPopupOpen(true)} />
      {popupOpen ?
        <Popup onClose={() => setPopupOpen(false)}>
          <Listing />
        </Popup>
        : ""
      }
    </div>
    </div>
  );
};

export default ExplorePage;
