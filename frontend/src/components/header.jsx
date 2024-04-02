import { Link } from 'react-router-dom';

import { LoginForm } from './login-form.jsx';

const Header = ({ user, setUser }) => {
  const logOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  };

  return (
    <div className="sticky top-0">
      <nav className="flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div>
          <Link to="/explore" className="text-2xl no-underline">PixelVault</Link>
        </div>
        <div>
          <Link to="/explore" className="text-lg no-underline ml-2">Explore | </Link>
          <Link to="/edit" className="text-lg no-underline ml-2">Edit | </Link>
          <Link to="/profile" className="text-lg no-underline ml-2">My Profile</Link>
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
