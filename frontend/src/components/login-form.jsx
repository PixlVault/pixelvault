import { useState } from 'react';
import * as Api from '../api.js';

export const LoginForm = ({ setUser }) => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);

  const login = async (e) => {
    e.preventDefault();
    const token = await Api.login(username, password);

    if (token !== null) {
      localStorage.setItem('user', username);
      localStorage.setItem('auth', token);
      setUser(username);
    }
  }

  return <>
    <form id="login-form" onSubmit={login}>
      Username: <input type="text" name="username" onChange={(e) => setUsername(e.target.value)} />
      Password: <input type="password" name="password" onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Log In</button>
    </form>
  </>
};