import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const { user } = useAuth();
  
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  const [isSavingCharity, setIsSavingCharity] = useState(false);
  
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // Fetch Charities list
      const { data: charitiesData } = await supabase
        .from('charities')
        .select('*')
        .order('name');
      if (charitiesData) setCharities(charitiesData);

      // Fetch Profile (User's linked charity)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, charities(*)')
        .eq('id', user.id)
        .single();
      if (profileData) setUserProfile(profileData);

      // Fetch Scores
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (scoresError) {
        console.error("Error fetching scores:", scoresError);
      } else {
        setScores(scoresData || []);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const handleCharityChange = async (e) => {
    const newCharityId = e.target.value;
    setIsSavingCharity(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        selected_charity_id: newCharityId 
      })
      .select('*, charities(*)')
      .single();

    if (error) {
      console.error("Error updating charity:", error);
      alert("Failed to update charity. Check your internet connection.");
    } else {
      setUserProfile(data);
      setIsEditingCharity(false);
    }
    setIsSavingCharity(false);
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert("You must be logged in with a valid account to submit a score.");
      return;
    }

    const scoreVal = parseInt(newScore);
    
    // Validation: 1-45 Stableford
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      alert("Invalid score. Must be between 1 and 45 Stableford points.");
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('scores')
      .insert([
        { user_id: user.id, date: newDate, value: scoreVal }
      ])
      .select();

    if (error) {
      console.error("Error inserting score:", error);
      alert("Failed to submit score: " + error.message);
      setIsSubmitting(false);
      return;
    }

    // Success
    const insertedScore = data[0];
    
    // Rolling logic: Keep latest 5, reverse chronological
    const updatedScores = [insertedScore, ...scores]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
      
    setScores(updatedScores);
    setNewScore('');
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      className="container py-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div>
          <h2>Welcome Back, <span className="text-primary">{user?.user_metadata?.fullName || 'Golfer'}</span></h2>
          <p className="text-text-muted">Manage your performance and track your charitable impact.</p>
        </div>
        <div className="md:ml-auto glass px-6 py-4 rounded-2xl border-primary/20 flex flex-col items-end hover:shadow-glow transition-all duration-300">
          <div className="text-sm text-text-muted">Subscription Status</div>
          <div className="text-primary font-bold flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Active • Yearly
          </div>
          <div className="text-xs text-text-muted mt-1">Renews 2027-03-20</div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Score Entry & History (2 Cols) */}
        <div className="md:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="glass-card">
            <h3 className="mb-4">Submit a Round</h3>
            <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm text-text-muted mb-1">Date Played</label>
                <input 
                  type="date" 
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-glow transition-all duration-300"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm text-text-muted mb-1">Stableford Score (1-45)</label>
                <input 
                  type="number" 
                  min="1"
                  max="45"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:shadow-glow transition-all duration-300"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="e.g. 36"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary w-full sm:w-auto h-[50px] border-none outline-none"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </motion.button>
            </form>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="m-0">Your Active Scores</h3>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">LAST 5 ROUNDS</span>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8 text-text-muted italic bg-black/20 rounded-xl border border-white/5 animate-pulse">
                Loading your rounds...
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 text-text-muted italic bg-black/20 rounded-xl border border-white/5">
                No scores submitted yet. Play a round to enter the next draw!
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {scores.map((score, idx) => (
                    <motion.div 
                      key={score.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-primary/50 hover:shadow-glow transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-mono font-bold text-white w-8">{score.value}</div>
                        <div className="text-sm text-text-muted">pts</div>
                      </div>
                      <div className="text-sm text-text-muted">{new Date(score.date).toLocaleDateString()}</div>
                      {idx === 0 && <div className="text-xs text-primary font-bold animate-pulse">LATEST</div>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Info (1 Col) */}
        <div className="space-y-8">
          <motion.div variants={itemVariants} className="glass-card flex flex-col items-center text-center hover:shadow-glow transition-all duration-500">
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 shadow-glow"
            >
              <span className="text-2xl">{userProfile?.charities ? '🌱' : '❓'}</span>
            </motion.div>
            <h3 className="mb-2">Your Impact</h3>
            
            {isEditingCharity ? (
              <div className="w-full mb-4 animate-fade-in">
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-primary mb-2"
                  value={userProfile?.selected_charity_id || ''}
                  onChange={handleCharityChange}
                  disabled={isSavingCharity}
                >
                  <option value="" disabled>Select a charity...</option>
                  {charities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => setIsEditingCharity(false)} className="text-xs text-text-muted hover:text-white transition-colors">
                    {isSavingCharity ? 'Saving...' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4 min-h-[40px]">
                  {userProfile?.charities 
                    ? <>You are directing <strong className="text-white">10%</strong> of your subscription to the <strong className="text-primary">{userProfile.charities.name}</strong>.</>
                    : <>You haven't selected a charity yet. Choose one to start making an impact!</>}
                </p>
                <button 
                  onClick={() => setIsEditingCharity(true)} 
                  className="text-primary text-sm font-semibold hover:underline"
                >
                  {userProfile?.charities ? 'Change Charity' : 'Select Charity'}
                </button>
              </>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card hover:shadow-glow transition-all duration-500">
            <h3 className="mb-4">Participation Summary</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-text-muted">Draws Entered:</span>
                <span className="text-white font-bold">12</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-muted">Total Won:</span>
                <span className="text-primary font-bold">£150.00</span>
              </li>
              <li className="flex justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-text-muted">Next Draw:</span>
                <span className="text-white font-bold">April 1st</span>
              </li>
            </ul>
          </motion.div>

          {/* Winnings & Proof Upload */}
          <motion.div variants={itemVariants} className="glass-card border-primary/30 shadow-glow-lg animate-float">
            <h3 className="mb-2 flex items-center gap-2">
              Claim Winnings
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            </h3>
            <p className="text-xs text-text-muted mb-4">You have an outstanding prize. Verify your latest round to claim.</p>
            
            <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
              <div className="text-sm text-text-muted mb-1">Pending Amount</div>
              <div className="text-2xl font-bold text-primary">£50.00</div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2" 
              onClick={() => alert("File upload dialog would open here. Proof of scorecard is sent to admins for manual review before Stripe payout.")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Upload Scorecard Proof
            </motion.button>
          </motion.div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default Dashboard;

