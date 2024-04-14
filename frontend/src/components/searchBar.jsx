import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import FilterForm from './filter-form.jsx';
import Popup from './popup.jsx';

const SearchBar = ({searchParams, setSearchParams}) => {
  const [filterFormOpen, setFilterFormOpen] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});


  const handleSearch = (e) => {
    e.preventDefault();
    const state = {};
    const input = searchParams.input.trim();
    const startChar = input.startsWith('#');
    const newQuery = input.split('#').map((s) => s.trim());
    if (startChar) {
      state.tags = [newQuery[0]];
    } else {
      state.title = newQuery[0];
    }
    if (newQuery.length > 1) {
      if (startChar) {
        state.tags = newQuery;
      }
      else {
        let discard = null;
        [discard, ...state.tags] = newQuery;
      }
    }
    navigate('/search?' + 
      [...Object.keys(state).map((key) => `${key}=${state[key]}`), 
      ...Object.keys(filters).map((key) => `${key}=${filters[key]}`)].join('&'));
  };


  return (
    <>
    <div className="justify-center mb-4 flex flex-row">
    <form onSubmit={handleSearch} className='w-2/4'>
      <input
        type="text"
        value={searchParams.input}
        onChange={(e) => setSearchParams({ ...searchParams, input: e.target.value })}
        placeholder="Search..."
        className=" w-full p-2 border border-gray-300 rounded-md"
      />
      </form>
      <button onClick={() => setFilterFormOpen(true)} >Filter</button>
    </div>
  {
    filterFormOpen
      ?
        <Popup title='Filters' onClose={() => setFilterFormOpen(false)}>
          <FilterForm filters = {filters} setFilters = {setFilters} setFilterFormOpen = {setFilterFormOpen}/>
        </Popup>
      : null
      }
  </>
  );
};

export default SearchBar;

// 
