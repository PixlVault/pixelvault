import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Editor from './components/editor.jsx';
import Header from './components/header.jsx';
import Footer from './components/footer.jsx';
import ExplorePage from './components/explore-page.jsx';
import Profile from './components/profile.jsx';
import FeedbackForm from './components/FeedbackForm.jsx';
import Report from './components/report.jsx';
import Search from './components/Search.jsx'; // Import Search component

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
          <ExplorePage user={user} />
        </div>
        <Footer/>
      </>
      ),
    },
    {
      path: '/profile/:username',
      element: (
        <>
          <Header user={user} setUser={setUser}/>
          <div className="flex flex-col min-h-screen items-center bg-gray-100">
            <Profile />
          </div>
          <Footer/>
        </>
      ),
    },
    {
      path: '/feedback',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <FeedbackForm />
        </div>
        <Footer/>
      </>
      ),
    },
    {
      path: '/report',
      element: (
      <>
        <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <Report />
        </div>
        <Footer/>
      </>
      ),
    },
    {
      path: '/search',
      element: (
        <>
          <Header user={user} setUser={setUser}/>
        <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100">
          <Search user={user} />
        </div>
          <Footer/>
        </>
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
