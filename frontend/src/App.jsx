import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Editor from './components/editor.jsx';
import { LoginForm } from './components/login-form.jsx';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import ExplorePage from './components/explore-page.jsx';
import ProfilePage from './components/profile-page.jsx';

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
        <Header/>
        
        <div id="app-content" className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <div>
            <div align="left"> {
              user !== null
                ? <p>Logged in as {user} <button onClick={logOut}>Log Out</button> </p>
                : <LoginForm setUser={setUser} />
            } </div>
          </div>
          <Editor user={user} />
        </div>

        <Footer/>
      </>),
    },
    {
      path: '/explore',
      element: (
      <>
        <Header/>
        <div id="app-content" className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <ExplorePage/>
        </div>
        <Footer/>
      </> 
      )
    },
    {
      path: '/profile',
      element: (
      <>
        <Header/>
        <div id="app-content" className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <ProfilePage/>
        </div>
        <Footer/>
      </>
      )
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
