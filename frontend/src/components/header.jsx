import { Link } from 'react-router-dom';
import { useState } from 'react';

import LoginForm from './login-form.jsx';
import Popup from './popup.jsx';
import Inbox from './inbox.jsx';
import Dropdown from './dropdown.jsx';

import { userImageBase, defaultImageUrl } from '../api/account/';

const Header = ({ user, setUser }) => {
  const logOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
    localStorage.removeItem('admin');
  };

  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);

  return (
    <div className="z-20 sticky top-0">
      <nav className="flex text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 sm:items-baseline w-full bg-gray-300">
        <div className="flex space-x-2 justify-center items-center">
          <img className="w-6 h-6 align-middle" src="/appicon.png" />
          <Link to="/explore" className="text-2xl no-underline">PixelVault</Link>
        </div>
        <div className='flex divide-x justify-center items-center'>
          <Link to="/explore" className="text-lg no-underline px-2">Explore</Link>
          <Link to="/edit" className="text-lg no-underline px-2">Edit</Link>

          {
            user !== null
              ?
              <div title="Inbox" className="px-2 hover:cursor-pointer" onClick={() => setInboxOpen(true)}>
                <img className="w-[20px] h-[20px]" src="/inbox.png" />
              </div>
              : ""
          }

          <div className="px-2">
            {
              user !== null
                ?
                <div>
                  <Dropdown titleElement={
                    <img
                      className='pixelated rounded-full w-[30px] h-[30px] hover:cursor-pointer align-middle '
                      src={`${userImageBase}${user}.png`}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = defaultImageUrl;
                      }}
                    />
                  }>
                    <div className="divide-y">
                      <Link to={`/profile/${user}`}>
                        <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1">My Profile</div>
                      </Link>
                      <div className="block px-4 py-2 text-sm hover:bg-gray-400 hover:cursor-pointer" tabIndex="-1" onClick={logOut}>Log out</div>
                    </div>
                  </Dropdown>
                </div>

                : <button onClick={() => setLoginFormOpen(true)}>Log In</button>
            }
          </div>
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
      {
        inboxOpen
          ?
          <Popup onClose={() => setInboxOpen(false)} title="Inbox">
            <Inbox />
          </Popup>
          : null
      }
    </div>
  );
};

export default Header;
