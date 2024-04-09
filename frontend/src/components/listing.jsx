import Comment from './comment.jsx';
import ListingInfo from './listing-info.jsx';

const Listing = () => {
  return (
    <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="flex flex-col justify-center items-center bg-gray-100">
        <div className="max-w-lg max-h-lg flex flex-col">

          <ListingInfo />

          <div className="flex flex-col w-full max-w-md mx-auto space-y-5">
            <textarea className="w-full h-12 resize-y border rounded-md p-2" placeholder="Add a comment..."></textarea>
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
        </div>
      </div>
    </div>
  );
};

export default Listing;
