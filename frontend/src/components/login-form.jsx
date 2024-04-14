import React, { useRef, useState } from 'react';
import Api from '../api';

const calculateAge = (date) => {
  const ageDate = new Date(Date.now() - date);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const LoginForm = ({ setUser }) => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [email, setEmail] = useState(null);
  const [dob, setDob] = useState(null);

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const formRef = useRef(null);

  const login = async (e) => {
    e.preventDefault();
    const token = await Api.account.login(username, password);

    if (token !== null) {
      localStorage.setItem('user', username);
      localStorage.setItem('auth', token);
      setUser(username);
    } else {
      setAlertMessage('Could not log in!');
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();

    try {
      if (!dob) throw new Error('Must enter your date of birth');
      const age = calculateAge(Date.parse(dob));
      if (age < 16) throw new Error('Must be at least 16 years of age to create an account.');
      await Api.account.create(username, password, email);
      login(e);
    } catch (error) {
      setAlertMessage(error.message);
      setTimeout(() => setAlertMessage(''), 2000);
    }
  };

  const inputClass = 'transition-all ease-in duration-50 mb-4 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-violet-500';

  return <>
    <form ref={formRef} id="login-form" className='px-8 pt-6 pb-8 mb-4 mx-auto flex flex-col items-center' onSubmit={login}>
      <span className='text-lg font-semibold mb-4'>{!creatingAccount ? 'Log In' : 'Sign Up' }</span>
      <input className={inputClass} type="text" placeholder='Username' name="username" onChange={(e) => setUsername(e.target.value)} />
      <input className={inputClass} type="password" placeholder='Password' name="password" onChange={(e) => setPassword(e.target.value)} />
      { creatingAccount
        ? <>
          <input className={inputClass} type='email' placeholder='Email' name='email' onChange={(e) => setEmail(e.target.value)}></input>
          <label htmlFor='dob'>Date of Birth</label>
          <input className={inputClass} type='date' name='dob' onChange={(e) => setDob(e.target.value)}></input>
          <button className='mb-4' type="submit" onClick={createAccount}>Register</button>
          <span className='text-red-600  mb-4'>{ alertMessage } &nbsp;</span>
          <span className='cursor-pointer text-violet-500 underline' onClick={() => setCreatingAccount(false)}>Already have an account? Log in!</span>
        </>
        : <>
          <button className='mb-4' type="submit" onClick={login}>Log In</button>
          <span className='text-red-600 mb-4'>{ alertMessage } &nbsp;</span>
          <span className='mb-2 cursor-pointer text-violet-500 underline' onClick={() => setCreatingAccount(true)}>Don&apos;t have an account? Sign up!</span>
        </>
      }
      <a className='cursor-pointer text-violet-500 underline' href="mailto:contact.pixelvault@gmail.com?subject=Account%20Recovery%20Request">Forgot your Password?</a>
    </form>
  </>
};

export default LoginForm;
