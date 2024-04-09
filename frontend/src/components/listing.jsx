import { Link } from 'react-router-dom';

import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

const Listing = () => {
  return (
    <div className="flex flex-col">
      <ListingInfo />

      <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
        <textarea className="w-full h-12 resize-y border rounded-md p-2 max-h-32" placeholder="Add a comment..."></textarea>
        <button className="max-w-third mx-auto">Comment</button>
      </div>

      <div className="max-h-80 overflow-auto divide-y">
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
        <Comment />
      </div>

      <div className="flex justify-center">
        <Link to="#">More like this...</Link>
      </div>
    </div>
  );
};

export default Listing;
