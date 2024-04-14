import React, { useEffect, useState } from 'react';

import { postImageBase } from '../api/post';
import { search } from '../api/post';
import { useLocation, useSearchParams } from 'react-router-dom';

import Popup from './popup';
import Listing from './listing';
import Tile from './tile';

const Results = ({ posts, onTileClick }) => {
  const f = (post) => <Tile
    key={post.post_id}
    post={post}
    clickHandler={() => onTileClick(post.post_id)}
  />;

  return (
    <div className="m-4 grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className='grid h-min w-full'>
        { posts.filter((_, idx) => idx % 3 === 0).map(f)}
      </div>
      <div className='grid h-min w-full'>
        { posts.filter((_, idx) => idx % 3 === 1).map(f) }
      </div>
      <div className='grid h-min w-full'>
        { posts.filter((_, idx) => idx % 3 === 2).map(f) }
      </div>
    </div>
  );
};


const Search = ({ user }) => {
  // We can pass in state from other components, which will land here:
  const [params, setParams] = useSearchParams();

  const [results, setResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  /** TODO: Search parameters to support:
   * @param {string} author Only show results published by a specific author.
   * @param {string} licence Only show results with a certain licence.
   * @param {string} tags An array of tags to filter against.
   * @param {string} order_by If specified, orders results by this field.
   * @param {boolean} ascending Boolean - should ordering be ascending or descending?
   * @param {boolean} only_show_followed Boolean - only show publications from followed users?
   *                             Note that this requires the requestingUser field.
   * @param {number} limit The number of results to fetch. Defaults to 25.
   * @param {number} offset The offset for returned results. Defaults to 0.
   */

  useEffect(() => {
    const parseParams = () => {
      const queries = {};
      // Filters/Search Parameters:
      ['title', 'author', 'licence', 'order_by'].forEach((key) => {
        if (params.get(key) !== null) queries[key] = params.get(key);
      });
      ['only_show_followed', 'ascending'].forEach((key) => {
        if (params.get(key) !== null) queries[key] = params.get(key) === 'true';
      });
      if (params.get('tags') !== null) queries.tags = params.get('tags')?.split(',');

      // Pagination:
      ['limit', 'offset'].forEach((key) => {
        if (params.get(key) !== null) queries[key] = Number.parseInt(params.get(key), 10);
      });

      return queries;
    };

    search(parseParams())
      .then((res) => setResults(res));
  }, [params]);

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true);
  };

  return (
      <div className='w-full md:w-1/2 2xl:w-1/3'>
        <div className="sticky top-0 bg-white z-50">
            <form className="max-w-md mx-auto">
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>
        </div>
        <Results posts={results} onTileClick={(postId) => openPopup(postId)} />
        {
          popupOpen
            ? <Popup onClose={() => setPopupOpen(false)}>
                <Listing user={user} postId={selectedPost} />
              </Popup>
            : null
        }
    </div>
  );
};

export default Search;
