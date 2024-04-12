import { useEffect, useState } from 'react';
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
  }

  return (
    <>
      <div>
        <div>Explore Page (Placeholder).</div>
        {
          loadedPosts != null ?
            <div className="flex">
              {
                loadedPosts.map(p =>
                  <div className="px-4" key={p.post_id}>
                    <img className="w-64 h-64 hover:cursor-pointer" src={`${postImageBase}${p.post_id}.png`} onClick={() => openPopup(p.post_id)} />
                  </div>
                )
              }

              {
                popupOpen ?
                  <Popup onClose={() => setPopupOpen(false)}>
                    <Listing user={user} postId={selectedPost} />
                  </Popup>
                  : ""
              }
            </div>
            :
            ""
        }
      </div>
    </>
  );
};

export default ExplorePage;
