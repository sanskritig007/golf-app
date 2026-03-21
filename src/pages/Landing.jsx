import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' }
  })
};

const Landing = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      const { data, error } = await supabase.from('charities').select('*').limit(6);
      if (data) setCharities(data);
      if (error) console.error("Error fetching charities:", error);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      <Hero />
      
      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden flex-1 border-b border-primary/10">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left -z-10" />
        
        <div className="container relative z-10">
          <div className="text-center mb-20">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block animate-pulse">The Engine</span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">How The Platform Works</h2>
            <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">A frictionless loop of real-world charity impact and gamified reward, specifically engineered for the modern golfer.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '01', title: 'Subscribe', desc: 'Secure your spot as a Founding or Club Member to unlock full dashboard access.', icon: '💳' },
              { num: '02', title: 'Route Impact', desc: 'Choose where your 10%+ monthly contribution goes from our roster of vetted partners.', icon: '🤝' },
              { num: '03', title: 'Log Scores', desc: 'Play golf. Upload your Stableford scorecards throughout the month to earn draw entries.', icon: '⛳' },
              { num: '04', title: 'Win Jackpots', desc: 'Match your scores in the official regulated monthly draw to win huge cash payouts.', icon: '🎯' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={stepVariants}
                className="glass-card relative border-t-4 border-t-primary/20 hover:border-t-primary hover:-translate-y-2 hover:shadow-glow transition-all duration-500 bg-black/40"
              >
                <div className="text-[80px] absolute -top-12 right-2 opacity-[0.03] font-black italic">{step.num}</div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mb-6 shadow-glow">
                  {step.icon}
                </div>
                <h3 className="text-2xl mb-3 text-white font-bold">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities Preview (Live connected to Supabase) */}
      <section className="py-32 bg-black">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl text-left">
              <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Direct Impact</span>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Our Charity Roster</h2>
              <p className="text-lg text-text-muted leading-relaxed">We have partnered with world-class, registered organizations making a measurable impact on the ground. Powering them with your subscription.</p>
            </div>
            <Link to="/subscribe" className="btn-ghost px-8 py-3 rounded-full hover:bg-white/5 border border-white/10 font-bold transition-all hover:border-primary/50 text-center flex items-center justify-center">
              Support a Charity Today
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {charities.map((charity, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
                  key={charity.id} 
                  className="glass-card overflow-hidden group p-0 flex flex-col bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-primary/50 cursor-pointer"
                >
                  <div className="h-44 bg-gradient-to-br from-black to-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute bottom-4 left-6 w-16 h-16 rounded-xl bg-black border border-white/10 flex items-center justify-center text-3xl shadow-xl transform translate-y-8 group-hover:-translate-y-2 transition-transform duration-500 z-10 ease-out flex-shrink-0">
                      🌍
                    </div>
                  </div>
                  <div className="pt-14 pb-8 px-6 flex-1 flex flex-col justify-between relative z-0">
                    <div>
                      <h4 className="text-2xl font-bold mb-3 text-white line-clamp-1">{charity.name}</h4>
                      <p className="text-sm text-text-muted line-clamp-3 mb-6 leading-relaxed">
                        Registered charity {charity.name} relies on contributions to build stronger communities locally and globally.
                      </p>
                    </div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                       Verified Partner <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse shadow-glow"></span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {charities.length === 0 && (
                <div className="col-span-full py-20 text-center text-text-muted glass-card border-dashed">
                  No charities found in the database. Ensure your Supabase `charities` table is populated.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
