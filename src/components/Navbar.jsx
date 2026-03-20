import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 py-4 mb-8">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold font-heading text-primary no-underline hover:opacity-80 transition-opacity">
          <span className="text-white">GOLF</span>CHARITY
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Home</NavLink>
          
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Dashboard</NavLink>
              <NavLink to="/draws" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Draws</NavLink>
              <button onClick={handleLogout} className="text-text-muted hover:text-red-400 font-medium transition-colors cursor-pointer bg-transparent border-none">Sign Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-text-muted hover:text-white font-medium transition-colors no-underline">Log In</NavLink>
              <NavLink to="/signup" className="btn-primary py-2 px-6 text-sm">Join Now</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

