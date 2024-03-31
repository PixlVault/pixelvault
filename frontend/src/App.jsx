import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './App.css';
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
        <div>
          <div align="left"> {
            user !== null
              ? <p>Logged in as {user} <button onClick={logOut}>Log Out</button> </p>
              : <LoginForm setUser={setUser} />
          } </div>
        </div>
        <Editor user={user} />
      </>),
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
