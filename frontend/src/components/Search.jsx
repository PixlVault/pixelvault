import React, { useEffect, useState } from 'react';
import { search } from '../api/post';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Popup from './popup';
import Listing from './listing';
import Tile from './tile';
import SearchBar from './searchBar';

const Results = ({ posts, onTileClick }) => {
  const f = (post) => (
    <Tile
      key={post.post_id}
      post={post}
      clickHandler={() => onTileClick(post.post_id)}
    />
  );

  return (
    <div className="m-4 grid grid-cols-1 md:grid-cols-3 gap-2">
      <div className='grid h-min w-full'>
        { posts.filter((_, idx) => idx % 3 === 0).map(f) }
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
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const parseParams = () => {
      const queries = {};
      ['title', 'author', 'licence', 'order_by'].forEach((key) => {
        if (params.get(key) !== null) queries[key] = params.get(key);
      });
      ['only_show_followed', 'ascending'].forEach((key) => {
        if (params.get(key) !== null) queries[key] = params.get(key) === 'true';
      });
      if (params.get('tags') !== null) queries.tags = params.get('tags')?.split(',');
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
    const offset = (newPage - 1) * limit;
    navigate(`?${params}&offset=${offset}`);
    setPage(newPage);
  };

  const prevPage = () => {
    if (page === 1) return;
    const newPage = page - 1;
    const limit = params.get('limit') === null ? 25 : Number.parseInt(params.get('limit'), 10);
    const offset = (newPage - 1) * limit;
    navigate(`?${params}&offset=${offset}`);
    setPage(newPage);
  };

  const openPopup = (postId) => {
    setSelectedPost(postId);
    setPopupOpen(true);
  };

  return (
    <div className='mt-4 w-1/3'>
      <SearchBar />
      <div>
        <Results posts={results} onTileClick={(postId) => openPopup(postId)} />
        <div className='flex justify-between'>
          <button onClick={prevPage}>Prev</button>
          { page }
          <button onClick={nextPage}>Next</button>
        </div>
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