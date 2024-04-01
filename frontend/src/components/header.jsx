const Header = () => {
  return (
    <div id="app-header" className="sticky top-0">
      <nav className="flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div>
          <a href="#" className="text-2xl no-underline">PixelVault</a>
        </div>
        <div>
          <a href="#" className="text-lg no-underline ml-2">Home | </a>
          <a href="#" className="text-lg no-underline ml-2">Search | </a>
          <a href="#" className="text-lg no-underline ml-2">Editor | </a>
          <a href="#" className="text-lg no-underline ml-2">My Profile</a>
        </div>
      </nav>
    </div>
  );
};

export default Header;
