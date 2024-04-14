import { useState } from 'react';
import Dropdown from './dropdown.jsx';

const FilterForm = ({ filters, setFilters, setFilterFormOpen }) => {
  const x = 0;
  return (
    <div className='m-6 justify-center'>
    <form>
    <label className="inline-flex items-center cursor-pointer p-3">
      <input type="checkbox" value="" onChange={(e) => setFilters({...filters, only_show_followed: e.target.checked })} className="sr-only peer"/>
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      <span className="ms-3 text-sm font-medium text-gray-900">Only Show Followed Accounts</span>
    </label>
    </form>
    <input
      onKeyDown={(e) => { if (e.key === 'Enter') setFilterFormOpen(false); } }
      placeholder='Search by author...'
      type= 'text'
      className='p-2 w-full'
      value = {filters?.author}
      onChange={(e) => setFilters({ ...filters, author: e.target.value })}
    />
    <div className='p-2'>
      <Dropdown title= 'License'>
      <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => { delete filters.licence; }}>None</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, licence: 'commerical' })}>Commerical</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, licence: 'educational' })}>Educational</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, licence: 'creative_commons' })}>Creative Commons</div>
        </Dropdown>
    </div>
    <div className='p-2'>
      <Dropdown title= 'Order By'>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, order_by: 'likes' })}>Likes</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, order_by: 'published_on' })}>Recent</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, order_by: 'title' })}>Titles</div>
        </Dropdown>
    </div>
    <div className='p-2'>
      <Dropdown title= 'Order'>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, ascending: true })}>Ascending</div>
          <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={() => setFilters({ ...filters, ascending: false })}>Descending</div>
        </Dropdown>
    </div>
    </div>
  );
};
export default FilterForm;
