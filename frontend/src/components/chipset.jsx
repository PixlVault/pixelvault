import React from 'react';

const ChipSet = ({ values, selected, setSelected }) => (
  <div className='flex '>
    { values.map((v) => <div
      key={v}
      className={`${v === selected ? 'bg-sky-300' : 'bg-grey-500 hover:bg-gray-200'} transition-all duration-100 px-4 mx-2 py-1 flex items-center justify-center border-2 text-center rounded-full`}
      onClick={() => setSelected(v)}
    >{v}</div>) }
  </div>
);

export default ChipSet;
