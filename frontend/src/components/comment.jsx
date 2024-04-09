const Comment = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center px-5">
      <div className="flex w-full items-stretch">
        <div className="grow">
          <h6 className="font-bold">Author</h6>
          <p>Comment Text</p>
        </div>
        <div className="flex flex-row space-x-5 justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <div>
              <img className="w-4 h-4 space-x-0" src="pixelartheart.png"/>
            </div>
            <div>100</div>
          </div>
          <div>...</div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
