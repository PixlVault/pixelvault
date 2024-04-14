import React, { useState } from 'react';

import Dropdown from './dropdown.jsx';
import ChipSet from './chipset.jsx';

const FilterForm = ({ filters, setFilters, setFilterFormOpen }) => {
  const [ascending, setAscending] = useState('Ascending');
  const ascendingValues = { Ascending: true, Descending: false };

  const [orderBy, setOrderBy] = useState('Most Recent');
  const orderByValues = { 'Most Recent': 'published_on', Likes: 'likes', Title: 'title' };

  const [licence, setLicence] = useState(null);
  const licenceValues = { All: undefined, Commerical: 'commercial', Educational: 'educational', 'Creative Commons': 'creative_commons' };

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
    <div>
      Licence
      <ChipSet values={Object.keys(licenceValues)} selected={licence} setSelected={(v) => { setLicence(v); setFilters({...filters, licence: licenceValues[v]}); } } />
    </div>
    <div>
      Order By
      <ChipSet values={Object.keys(orderByValues)} selected={orderBy} setSelected={(v) => { setOrderBy(v); setFilters({...filters, order_by: orderByValues[v]}); } } />
    </div>
    <div>
      Order
      <ChipSet values={Object.keys(ascendingValues)} selected={ascending} setSelected={(v) => { setAscending(v); setFilters({...filters, ascending: ascendingValues[v]}) } } />
    </div>
    </div>
  );
};
export default FilterForm;
