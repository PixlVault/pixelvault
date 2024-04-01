import {LoginForm} from './login-form.jsx';

const Header = ({user, setUser}) => {
  const logOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  };
  
  return (
    <div id="app-header" className="sticky top-0">
      <nav className="flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div>
          <a href="#" className="text-2xl no-underline">PixelVault</a>
        </div>
        <div>
          <a href="/explore" className="text-lg no-underline ml-2">Explore | </a>
          <a href="/edit" className="text-lg no-underline ml-2">Edit | </a>
          <a href="/profile" className="text-lg no-underline ml-2">My Profile</a>
        </div>
      </nav>
      <div className="bg-gray-100">
        <div align="right"> {
          user !== null
            ? <p>Logged in as {user} <button onClick={logOut}>Log Out</button> </p>
            : <LoginForm setUser={setUser} />
        } </div>
      </div>
    </div>
  );
};

export default Header;
