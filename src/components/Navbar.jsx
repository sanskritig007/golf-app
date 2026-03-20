import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="glass sticky top-0 z-50 py-4 mb-8">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold font-heading text-primary no-underline">
          <span className="text-white">GOLF</span>CHARITY
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors"}>Home</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors"}>Dashboard</NavLink>
          <NavLink to="/draws" className={({ isActive }) => isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors"}>Draws</NavLink>
          <NavLink to="/subscribe" className="btn-primary py-2 px-6 text-sm">Join Now</NavLink>
        </div>
        
        {/* Mobile menu could go here */}
      </div>
    </nav>
  );
};

export default Navbar;
