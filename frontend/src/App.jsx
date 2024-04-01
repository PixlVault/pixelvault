import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Editor from './components/editor.jsx';
import { LoginForm } from './components/login-form.jsx';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));
  const logOut = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
  };

  const router = createBrowserRouter([
    {
      path: '/edit/:projectId?',
      element: (
      <>
        <div id="app" className="bg-gray-100">
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
          
          <div id="app-content" className="flex flex-col min-h-screen justify-center items-center">
            <div>
              <div align="left"> {
                user !== null
                  ? <p>Logged in as {user} <button onClick={logOut}>Log Out</button> </p>
                  : <LoginForm setUser={setUser} />
              } </div>
            </div>
            <Editor user={user} />
          </div>

          <div id="app-footer">
            <div className="flex flex-row justify-center items-center py-4 px-6 bg-gray-300">
                <a href="#" className="text-lg no-underline ml-2">Contact Us | </a>
                <a href="#" className="text-lg no-underline ml-2">Tutorial | </a>
                <a href="#" className="text-lg no-underline ml-2">Terms and Conditions</a>
            </div>
          </div>
        </div>
      </>),
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
