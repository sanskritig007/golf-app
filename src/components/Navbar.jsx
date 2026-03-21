import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const Navbar = () => {
  const { user, logoutMockUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { isSupabaseConfigured } = await import('../utils/supabase');
    if (!isSupabaseConfigured) {
      logoutMockUser();
    } else {
      await supabase.auth.signOut();
    }
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="glass sticky top-0 z-50 py-4 mb-8">
      <div className="container flex items-center justify-between">
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 text-2xl font-extrabold font-heading text-primary no-underline hover:opacity-80 transition-opacity z-50">
          <span className="text-white">GOLF</span>CHARITY
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Home</NavLink>
          
          {user ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Dashboard</NavLink>
              <NavLink to="/draws" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Draws</NavLink>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? "text-primary no-underline font-medium" : "text-text-muted hover:text-white no-underline font-medium transition-colors")}>Admin Console</NavLink>
              <button onClick={handleLogout} className="text-text-muted hover:text-red-400 font-medium transition-colors cursor-pointer bg-transparent border-none">Sign Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-text-muted hover:text-white font-medium transition-colors no-underline">Log In</NavLink>
              <NavLink to="/signup" className="btn-primary py-2 px-6 text-sm">Join Now</NavLink>
            </>
          )}
        </div>
        
        {/* Mobile Hamburger Icon */}
        <button 
          className="md:hidden text-white p-2 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#0a0a0b] border-b border-white/10 shadow-2xl md:hidden animate-fade-in flex flex-col items-center py-6 gap-6 z-40">
            <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "text-primary text-xl font-medium" : "text-white text-xl font-medium")}>Home</NavLink>
            
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "text-primary text-xl font-medium" : "text-white text-xl font-medium")}>Dashboard</NavLink>
                <NavLink to="/draws" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "text-primary text-xl font-medium" : "text-white text-xl font-medium")}>Draws</NavLink>
                <NavLink to="/admin" onClick={closeMobileMenu} className={({ isActive }) => (isActive ? "text-primary text-xl font-medium" : "text-white text-xl font-medium")}>Admin Console</NavLink>
                <button onClick={handleLogout} className="text-red-400 text-xl font-medium">Sign Out</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMobileMenu} className="text-white text-xl font-medium">Log In</NavLink>
                <NavLink to="/signup" onClick={closeMobileMenu} className="btn-primary py-3 px-8 text-lg w-[80%] text-center">Join Now</NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

