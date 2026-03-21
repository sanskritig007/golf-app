import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-white/5 pt-16 pb-8 border-primary/10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-heading font-bold tracking-tight text-white mb-4 block">
              GOLF<span className="text-primary">CHARITY</span>
            </Link>
            <p className="text-text-muted text-sm max-w-md leading-relaxed">
              The world's premium golf subscription platform dedicated to turning your passion for the game into real-world, localized impact for the charities that matter most to you.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Platform</h4>
            <ul className="space-y-3 text-sm text-text-muted">
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Member Dashboard</Link></li>
              <li><Link to="/draws" className="hover:text-primary transition-colors">Official Draw Engine</Link></li>
              <li><Link to="/subscribe" className="hover:text-primary transition-colors">Pricing & Subscribe</Link></li>
            </ul>
          </div>
          
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Charity Transparency</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Availability</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li className="flex items-center gap-2 opacity-80">
                  <span>🌍</span> Region: <strong>UK (Global Q4)</strong>
                </li>
                <li className="flex items-center gap-2 opacity-80">
                  <span>📱</span> Mobile App: <strong className="text-primary">Coming Soon</strong>
                </li>
              </ul>
            </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <div>&copy; {new Date().getFullYear()} Golf Charity Platform. All rights reserved.</div>
          <div className="flex gap-4 items-center">
            <span className="relative flex h-1.5 w-1.5 align-middle">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span className="text-primary font-bold tracking-wide">100% REGULATED DRAW</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
