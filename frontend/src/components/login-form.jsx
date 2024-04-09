import { useRef, useState, useEffect } from 'react';
import * as Api from '../api.js';

const LoginForm = ({ ref, setUser, loginFormOpen, setLoginFormOpen }) => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [email, setEmail] = useState(null);

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const formRef = useRef(null);

  const login = async (e) => {
    e.preventDefault();
    const token = await Api.login(username, password);

    if (token !== null) {
      localStorage.setItem('user', username);
      localStorage.setItem('auth', token);
      setUser(username);
      setLoginFormOpen(false);
    } else {
      setAlertMessage('Could not log in!');
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      await Api.createAccount(username, password, email);
      login(e);
    } catch (error) {
      setAlertMessage(error.message);
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  useEffect(() => {
    const detectOutsideClick = (e) => {
      if (!formRef.current.contains(e.target)) setLoginFormOpen(false);
    };

    document.addEventListener('mousedown', detectOutsideClick);
    return (() => document.removeEventListener('mousedown', detectOutsideClick));
  }, []);

  const inputClass = 'mb-4 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-500';

  return <>
    <div>
      <form ref={formRef} id="login-form" className='px-8 pt-6 pb-8 mb-4 mx-auto flex flex-col items-center' onSubmit={login}>
        <span className='text-lg font-semibold mb-4'>{!creatingAccount ? 'Log In' : 'Sign Up' }</span>
        <input className={inputClass} type="text" placeholder='Username' name="username" onChange={(e) => setUsername(e.target.value)} />
        <input className={inputClass} type="password" placeholder='Password' name="password" onChange={(e) => setPassword(e.target.value)} />
        { creatingAccount
          ? <>
            <input className={inputClass} type='email' placeholder='Email' name='email' onChange={(e) => setEmail(e.target.value)}></input>
            <button className='mb-4' type="submit" onClick={createAccount}>Register</button>
            <span className='text-red-600  mb-4'>{ alertMessage } &nbsp;</span>
            <span className='cursor-pointer text-violet-500 underline' onClick={() => setCreatingAccount(false)}>Already have an account? Log in!</span>
          </>
          : <>
            <button className='mb-4' type="submit" onClick={login}>Log In</button>
            <span className='text-red-600 mb-4'>{ alertMessage } &nbsp;</span>
            <span className='cursor-pointer text-violet-500 underline' onClick={() => setCreatingAccount(true)}>Don&apos;t have an account? Sign up!</span>
          </>
        }
      </form>
    </div>
  </>
};

export default LoginForm;
