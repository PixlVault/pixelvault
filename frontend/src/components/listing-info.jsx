import { Link } from 'react-router-dom';

import { postImageBase } from '../api/post';

const ListingInfo = ({ postId, title, author, licence, likes, tags, likePost, unlikePost, likedThisPost }) => {
  if (tags != null) {
    var tagRows = [];
    const tagsPerRow = 3;
    for (let i = 0; i < tags.length; i += 3) {
      tagRows.push(tags.slice(i, i + tagsPerRow));
    }
  }

  return (
    <div className="w-full h-full grid grid-flow-row-dense grid-cols-2 grid-rows-1">
      <div>
        <img className="px-4 py-4" src={`${postImageBase}${postId}.png`} />
      </div>
      <div>
        <div className="h-full grid grid-flow-row-dense grid-cols-2 grid-rows-3">
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <h4><Link to={`/profile/${author}`}>{author}</Link></h4>
          </div>
          <div className="flex flex-col justify-center items-center">
            {
              likedThisPost ?
                <img className="w-12 hover:cursor-pointer" src="pixelartheart.png" onClick={unlikePost} />
                :
                <img className="w-12 hover:cursor-pointer" src="pixelartheart_empty.png" onClick={likePost} />
            }

            <h2 className="text-xl">{likes}</h2>
          </div>
          <div className="flex flex-col justify-center items-center text-center">
            <Link to="#"><h4 className="hover:underline">{licence}</h4></Link>
          </div>
          <div className="flex flex-col justify-center items-center">
            <button className="bg-red-600">Report</button>
          </div>
          <div className="flex flex-col col-span-2 space-y-2 max-h-[70px] overflow-y-auto">
            {
              tags != null ?
                tagRows.map(row =>
                  <div className="flex w-full" key={row}>
                    {row.map(x =>
                      <div className="max-w-third min-w-xs truncate px-2 mx-auto bg-blue-300 text-center rounded-md" key={x}>
                        <Link to="#" title={x}>{x}</Link> {/* TODO: Link to an appropriate search. */}
                      </div>
                    )}
                  </div>
                )
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingInfo;
