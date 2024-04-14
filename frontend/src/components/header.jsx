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
    <div className="z-20 sticky top-0">
      <nav className="flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div>
          <Link to="/explore" className="text-2xl no-underline">PixelVault</Link>
        </div>
        <div className='divide-x'>
          <Link to="/explore" className="text-lg no-underline px-2">Explore</Link>
          <Link to="/edit" className="text-lg no-underline px-2">Edit</Link>
          {
            user !== null
              ? <Link to={`/profile/${user}`} className="text-lg no-underline px-2">My Profile</Link>
              : null
          }
          {
            user !== null
              ? <span>Logged in as {user} <button className='py-2' onClick={logOut}>Log Out</button> </span>
              : <button className='py-2' onClick={() => setLoginFormOpen(true)}>Log In</button>
          }
        </div>
      </nav>
      {
        loginFormOpen
          ?
          <Popup onClose={() => setLoginFormOpen(false)}>
            <LoginForm setUser={(user) => {
              setUser(user);
              setLoginFormOpen(false)
            }} />
          </Popup>
          : null
      }
    </div>
  );
};

export default Header;
