import { Link } from 'react-router-dom';
import { useState } from 'react';

import LoginForm from './login-form.jsx';
import Popup from './popup.jsx';

const Header = ({ user, setUser }) => {
  const logOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  };

  const [loginFormOpen, setLoginFormOpen] = useState(false);

  return (
    <div className="sticky top-0">
      <nav className="flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div>
          <Link to="/explore" className="text-2xl no-underline">PixelVault</Link>
        </div>
        <div className='divide-x'>
          <Link to="/explore" className="text-lg no-underline px-2">Explore</Link>
          <Link to="/edit" className="text-lg no-underline px-2">Edit</Link>
          <Link to="/profile" className="text-lg no-underline px-2">My Profile</Link>
          {
            user !== null
              ? <span>Logged in as {user} <button onClick={logOut}>Log Out</button> </span>
              : <button onClick={() => setLoginFormOpen(true)}>Log In</button>
          }
        </div>
      </nav>
      {
        loginFormOpen
          ? 
          <Popup>
            <LoginForm setUser={setUser} loginFormOpen={loginFormOpen} setLoginFormOpen={setLoginFormOpen} />
          </Popup>
          : null
      }
    </div>
  );
};

export default Header;
