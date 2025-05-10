
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-white border-t">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">© {new Date().getFullYear()} Intelligent Meeting Assistant</p>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-app-blue transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-sm text-gray-600 hover:text-app-blue transition-colors">
              Dashboard
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-app-blue transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-app-blue transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
