import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden min-h-[90vh] border-b border-primary/10 flex flex-col justify-center">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] text-accent -right-[10%] w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full mix-blend-screen"
        />
      </div>
      
      {/* Overlay grid pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none -z-10"></div>
      
      <div className="container relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-primary/20 text-primary text-sm font-semibold mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next Draw: April 1st • Est. £25,000 Jackpot
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-5xl mx-auto mb-8 font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg"
        >
          Change Lives With <span className="text-primary italic">Every Round</span> You Play.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto text-xl text-text-muted mb-12"
        >
          Join the premium golf community where performance tracking meets purpose. Your subscription powers life-changing charities while you compete for guaranteed monthly prize pools.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link to="/subscribe" className="btn-primary text-xl px-12 py-5 w-full sm:w-auto shadow-glow-lg hover:scale-105 transition-all duration-300">
            Start Your Impact
          </Link>
          <Link to="/draws" className="btn-ghost text-xl px-12 py-5 w-full sm:w-auto hover:bg-white/5 transition-all duration-300">
            View Live Draw Engine
          </Link>
        </motion.div>
        
        {/* Social Proof / Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          {[
            { metric: "£1.2M+", label: "Donated" },
            { metric: "15k+", label: "Golfers" },
            { metric: "100%", label: "Transparency" },
            { metric: "£500k", label: "Monthly Pool" }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 bg-black/40 hover:bg-black/60 border-white/5 hover:border-primary/30 transition-all duration-500">
              <div className="text-3xl font-black font-heading text-white mb-2 tracking-tight drop-shadow-md">{stat.metric}</div>
              <div className="text-xs text-primary font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
