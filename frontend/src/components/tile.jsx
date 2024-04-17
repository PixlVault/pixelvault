import { postImageBase } from '../api/post';

const Tile = ({ post, clickHandler }) => (
    <div className='border rounded relative' onClick={clickHandler}>
    {/* <div className='mb-2 relative' onClick={clickHandler}> */}
        <img className="pixelated h-auto min-w-full rounded-lg" src={`${postImageBase}${post.post_id}.png`} alt="" />
        <div className="rounded-lg opacity-0 hover:bg-black/50 hover:opacity-100 duration-300 flex justify-normal items-end absolute inset-0 z-10  text-2xl text-white font-semibold">
        <p className='mx-2 mb-1 truncate'>{post.title}</p>
        </div>
    </div>
);

export default Tile;
