import React, { useEffect, useState } from 'react';

import { postImageBase } from '../api/post';
import { search } from '../api/post';
import { useLocation, useSearchParams } from 'react-router-dom';

import Popup from './popup';
import Listing from './listing';
import Tile from './tile';
import SearchBar from './searchBar';

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
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  /** TODO: Search parameters to support:
   * @param {string} author Only show results published by a specific author. done
   * @param {string} title Only show results with specified titles. done
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

  const nextPage = () => {
    const newPage = page + 1;
    const limit = params.get('limit') === null ? 25 : Number.parseInt(params.get('limit'), 10);
    let newParams = params;
    newParams.set('offset', ((newPage - 1) * limit).toString());
    setPage(newPage);
    setParams(params);
  };

  const prevPage = () => {
    if (page === 1) return;
    const newPage = page - 1;
    const limit = params.get('limit') === null ? 25 : Number.parseInt(params.get('limit'), 10);
    let newParams = params;
    newParams.set('offset', ((newPage - 1) * limit).toString());
    setPage(newPage);
    setParams(newParams);
  };

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true);
  };

  return (
    <div className='mt-4 w-1/3'>
    <SearchBar />
    <div>
      <div className='flex justify-between'>
        <button onClick={prevPage}>Prev</button>
        Page { page }
        <button onClick={nextPage}>Next</button>
      </div>
      <Results posts={results} onTileClick={(postId) => openPopup(postId)} />
    </div>
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
