import { postImageBase } from '../api/post';

const Tile = ({ post, clickHandler }) => (
    <div className='relative' onClick={clickHandler}>
    {/* <div className='mb-2 relative' onClick={clickHandler}> */}
        <img className="h-auto min-w-full rounded-lg" src={`${postImageBase}${post.post_id}.png`} alt="" />
        <div className="rounded-lg opacity-0 hover:bg-black/50 hover:opacity-100 duration-300 flex justify-normal items-end absolute inset-0 z-10  text-3xl text-white font-semibold">
        <span className='ml-2 mb-1'>{post.title}</span>
        </div>
    </div>
);

export default Tile;
