import { Link } from 'react-router-dom';

const Footer = () => (
  <div className="h-10">
    <div className="flex flex-row justify-center items-center py-4 px-6 bg-gray-300">
        <Link to="/feedback" className="text-lg no-underline ml-2">Contact Us | </Link>
        <Link to="#" className="text-lg no-underline ml-2">Tutorial | </Link>
        <Link to="#" className="text-lg no-underline ml-2">Terms and Conditions</Link>
    </div>
  </div>
);

export default Footer;
