import { useState } from 'react';

import Listing from './listing.jsx';
import Popup from './popup.jsx';

const ExplorePage = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
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
  );
};

export default ExplorePage;
