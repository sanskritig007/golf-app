import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CharityProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const fetchCharity = async () => {
      const { data, error } = await supabase.from('charities').select('*').eq('id', id).single();
      if (data) setCharity(data);
      if (error) {
        console.error(error);
        navigate('/charities'); // Redirect if not found
      }
      setLoading(false);
    };
    fetchCharity();
  }, [id, navigate]);

  const handleSelectCharity = async () => {
    if (!user) {
      alert("Please log in or sign up to support this charity.");
      navigate('/login');
      return;
    }
    
    setIsSelecting(true);
    const { error } = await supabase
      .from('profiles')
      .update({ selected_charity: charity.id })
      .eq('id', user.id);
      
    setIsSelecting(false);
    if (!error) {
      alert(`Success! 10% of your subscription is now routed to ${charity.name}.`);
      navigate('/dashboard');
    } else {
      alert("Error updating charity selection.");
    }
  };

  if (loading) {
    return (
      <div className="container py-32 flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-primary"></div>
      </div>
    );
  }

  if (!charity) return null;

  return (
    <div className="animate-fade-in relative pb-24 min-h-screen">
      {/* Profile Header */}
      <div className="relative h-[40vh] min-h-[400px] flex items-end border-b border-white/10 overflow-hidden mt-8 md:mt-0 rounded-b-3xl md:rounded-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/50 to-primary/20 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
        
        <div className="container relative z-20 pb-12 w-full flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="flex items-end gap-6 w-full">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-black rounded-3xl border-2 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center text-4xl md:text-6xl flex-shrink-0 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
              🌍
            </div>
            <div>
              <div className="text-primary font-bold tracking-widest uppercase text-xs mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Verified Global Partner
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-0 text-white drop-shadow-lg leading-tight">{charity.name}</h1>
            </div>
          </div>
          
          <button 
            onClick={handleSelectCharity}
            disabled={isSelecting}
            className="btn-primary px-8 py-4 text-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3 w-full md:w-auto justify-center hover:scale-[1.02] transition-transform flex-shrink-0"
          >
            {isSelecting ? 'Updating Profile...' : 'Support This Cause'}
          </button>
        </div>
      </div>

      <div className="container pt-16">
        <Link to="/charities" className="text-text-muted hover:text-white transition-colors text-sm font-semibold mb-8 inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10">
          ← Back to Directory
        </Link>
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-12">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
              <h3 className="text-2xl mb-4 font-bold border-b border-primary/20 pb-2 inline-block">Our Mission</h3>
              <p className="text-text-muted text-lg leading-relaxed">
                {charity.name} is dedicated to creating sustainable, localized impact. We believe that empowering communities through targeted resource allocation yields compounding generational wealth. Partnering with the Golf Charity Platform allows us to safely and transparently fund our critical initiatives directly via player subscriptions.
              </p>
              <p className="text-text-muted text-lg leading-relaxed mt-4">
                Thank you to all founding members for routing your recurring monthly play towards our cause.
              </p>
            </motion.div>
            
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
              <h3 className="text-2xl mb-6 font-bold flex items-center gap-3">Upcoming Impact Events <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">Live Map</span></h3>
              <div className="space-y-4">
                {[
                  { title: "Annual Spring Gala", date: "April 15, 2026", type: "Fundraiser" },
                  { title: "Community Volunteer Day", date: "May 2, 2026", type: "On-site" },
                  { title: "Charity Golf Scramble", date: "June 10, 2026", type: "Tournament" }
                ].map((event, i) => (
                  <div key={i} className="glass-card p-5 flex justify-between items-center hover:bg-white/[0.05] transition-colors group cursor-pointer border hover:border-primary/30">
                    <div>
                      <h4 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{event.title}</h4>
                      <div className="text-sm text-text-muted">{event.date}</div>
                    </div>
                    <div className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-white/70 border border-white/10">
                      {event.type}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Stats */}
          <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.3}} className="space-y-6">
            <div className="glass-card bg-black border-primary/20 shadow-[-10px_10px_30px_rgba(16,185,129,0.05)]">
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-4 font-bold">Platform Impact</h4>
              <div className="text-5xl font-black text-white mb-1 font-heading">£42,500</div>
              <div className="text-sm text-primary font-semibold mb-6">Total Raised via Golfers</div>
              
              <div className="space-y-3 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted font-medium">Active Supporters</span>
                  <span className="font-bold text-white">1,240 members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted font-medium">Average ROI</span>
                  <span className="font-bold text-white">94% to source</span>
                </div>
              </div>
            </div>
            
            <div className="glass-card bg-white/[0.02]">
              <h4 className="text-sm text-text-muted uppercase tracking-wider mb-4 font-bold">Transparency</h4>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                This organization undergoes quarterly audits by independent financial evaluators to ensure peak routing efficiency.
              </p>
              <a href="#" className="text-primary text-sm font-bold flex items-center gap-2 hover:underline">
                View 2025 Audit Report <span className="opacity-50">↗</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CharityProfile;
