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
          <Listing postId='8ab21ce0-f81e-11ee-aed8-21a81ea1c251'/>
        </Popup>
        : ""
      }
    </div>
    </>
  );
};

export default ExplorePage;
