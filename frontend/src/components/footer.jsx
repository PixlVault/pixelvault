import { Link } from 'react-router-dom';

const Footer = () => (
  <div className="h-10">
    <div className="flex flex-row justify-center items-center py-4 px-6 bg-gray-300">
        <Link to="/feedback" className="text-lg no-underline ml-2">Contact Us | </Link>
        <Link to="https://pixlvault.github.io/pixelvault/" className="text-lg no-underline ml-2">User Manual | </Link>
        <Link to="/credit" className="text-lg no-underline ml-2">Credit</Link>
    </div>
  </div>
);

export default Footer;
