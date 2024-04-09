import { useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import Editor from './components/editor.jsx';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import ExplorePage from './components/explore-page.jsx';
import ProfilePage from './components/profile-page.jsx';
import Listing from './components/listing.jsx';

function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Navigate to="/explore" />,
    },
    {
      path: '/edit/:projectId?',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <Editor user={user} />
        </div>

        <Footer/>
      </>),
    },
    {
      path: '/explore',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <ExplorePage/>
        </div>
        <Footer/>
      </>
      ),
    },
    {
      path: '/profile',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <ProfilePage/>
        </div>
        <Footer/>
      </>
      ),
    },
    {
      
      path: '/listing',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="flex flex-col justify-center items-center bg-gray-100">
            <Listing/>
          </div>
        </div>
        
        <Footer/>
      </>
      ),
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
