const Comment = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center px-5">
      <div className="flex w-full items-stretch">
        <div className="grow">
          <h6 className="font-bold">Author</h6>
          <p>Comment Text</p>
        </div>
        <div className="flex flex-row space-x-5">
          <p>100</p>
          <div>...</div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
