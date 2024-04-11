import React from 'react';

import { postImageBase } from '../api/post';

const tile = (postId) => (
  <div className='mb-4 relative'>
    <img className="w-full rounded-lg" src={`https://flowbite.s3.amazonaws.com/docs/gallery/masonry/image-${postId}.jpg`} alt="" />
    {/* <img className="w-full rounded-lg" src={`${postImageBase}${postId}.png`} alt="" /> */}
    <div className="rounded-lg opacity-0 hover:bg-black/50 hover:opacity-100 duration-300 flex justify-normal items-end absolute inset-0 z-10  text-3xl text-white font-semibold">
      <span className='ml-2 mb-1'>Test {postId}</span>
    </div>
  </div>
);

const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function Search() {
  return (
      <div>
        <div className="sticky top-0 bg-white z-50">
            <form className="max-w-md mx-auto">
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>
        </div>
        <div className="m-4 columns-1 md:columns-3 gap-4">
            {ids.map((id) => tile(id))}
        </div>
    </div>
  );
}

export default Search;
