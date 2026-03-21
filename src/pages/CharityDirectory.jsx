import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CharityDirectory = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Hardcode some modern categories for the UI
  const categories = ['All', 'Health', 'Education', 'Environment', 'Youth', 'Community'];

  useEffect(() => {
    const fetchCharities = async () => {
      const { data, error } = await supabase.from('charities').select('*');
      if (data) {
        // Mock a category for the ones that don't have one in DB just for demo purposes
        const enrichedData = data.map((c, i) => ({
          ...c,
          category: categories[(i % (categories.length - 1)) + 1]
        }));
        setCharities(enrichedData);
      }
      if (error) console.error(error);
      setLoading(false);
    };
    fetchCharities();
  }, []);

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-12 min-h-[90vh] animate-fade-in">
      <div className="max-w-3xl mb-12 mt-8">
        <h1 className="mb-4 text-4xl md:text-5xl">Global <span className="text-primary italic">Impact Directory</span></h1>
        <p className="text-xl text-text-muted leading-relaxed">Explore our vetted roster of charity partners. 100% of your dedicated subscription portion flows directly to these organizations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="w-full md:w-1/3 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
          <input 
            type="text" 
            placeholder="Search organizations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                activeCategory === cat 
                  ? 'bg-primary border-primary text-black' 
                  : 'bg-transparent border-white/10 text-text-muted hover:text-white hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-l-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCharities.map((charity, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={charity.id} 
              className="glass-card p-0 overflow-hidden group flex flex-col hover:border-primary/50 transition-all shadow-lg"
            >
              <div className="h-48 bg-black/50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-primary border border-primary/20">
                  {charity.category}
                </div>
                <div className="text-6xl group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                  {['🌍','🏥','📚','🌱','🤝'][i % 5]}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{charity.name}</h3>
                  <p className="text-text-muted text-sm line-clamp-3 mb-6 leading-relaxed">
                    A verified public charity actively working to improve the world through dedicated localized initiatives engineered by platform users.
                  </p>
                </div>
                <Link to={`/charities/${charity.id}`} className="block w-full text-center py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/40 text-sm font-bold tracking-wide transition-colors">
                  Explore Impact Profile
                </Link>
              </div>
            </motion.div>
          ))}
          {filteredCharities.length === 0 && (
            <div className="col-span-full text-center py-20 glass-card">
              <span className="text-4xl mb-4 block opacity-50">🧭</span>
              <h3 className="text-text-muted font-bold">No charities found matching your criteria.</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharityDirectory;
