const ListingInfo = () => {
  return (
    <div className="w-full h-full grid grid-flow-row-dense grid-cols-2 grid-rows-1">
      <div>
        <img className="px-4 py-4" src="sr25f64d3c492aws3.png" />
      </div>
      <div>
        <div className="h-full grid grid-flow-row-dense grid-cols-2 grid-rows-3">
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-xl font-bold">Image Title</h2>
            <h4>Author</h4>
          </div>
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-xl">12k</h2>
          </div>
          <div className="flex flex-col justify-center items-center">
            <button>License</button>
          </div>
          <div className="flex flex-col justify-center items-center">
            <button className="bg-red-600">Report</button>
          </div>
          <div className="flex flex-col col-span-2 space-y-2">
            <div className="flex w-full">
              <div className="max-w-third min-w-xs truncate px-2 mx-auto bg-blue-300 text-center rounded-md">#Tag1LongTextHere</div>
              <div className="max-w-third min-w-xs truncate px-2 mx-auto bg-blue-300 text-center rounded-md">#Tag2</div>
              <div className="max-w-third min-w-xs truncate px-2 mx-auto bg-blue-300 text-center rounded-md">#Tag3</div>
            </div>
            <div className="flex justify-center">
              <button className="w-1/2 justify-center items-center">See More...</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingInfo;
