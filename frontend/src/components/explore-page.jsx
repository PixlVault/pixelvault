import { useEffect, useState } from 'react';
import { search } from '../api/post';
import createData from '../createData';
import Listing from './listing.jsx';
import Popup from './popup.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
    <div>
      <div>Explore Page.</div>
      
      {/* TODO: Use actual published posts rather than this hardcoded one */}
      <img className="w-64 h-64 hover:cursor-pointer" src="sr25f64d3c492aws3.png" onClick={() => setPopupOpen(true)} />
      {popupOpen ?
        <Popup onClose={() => setPopupOpen(false)}>
          <Listing postId='6aef2230-f699-11ee-9e04-5118cf3f67c7'/>
        </Popup>
        : ""
      }
    </div>
    </>
  );
};

export default ExplorePage;
