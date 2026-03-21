import React, { useState, useEffect, useRef } from 'react';
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

const CLAIM_TEST_QUERY_PARAM = 'claimTest';

const createMockPendingWin = (amount = 50) => ({
  id: 'mock-pending-win',
  amount_won: amount,
  status: 'pending_proof',
  isMock: true,
});

const Dashboard = () => {
  const { user } = useAuth();
  
  const [scores, setScores] = useState([]);
  const [charities, setCharities] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  const [isSavingCharity, setIsSavingCharity] = useState(false);
  
  const [totalWon, setTotalWon] = useState(0);
  const [drawsEntered, setDrawsEntered] = useState(0);
  const [nextDraw, setNextDraw] = useState('Checking...');
  const [pendingWin, setPendingWin] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isClaimTestMode, setIsClaimTestMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const queryEnabled = params.get(CLAIM_TEST_QUERY_PARAM) === '1';
    const storedEnabled = window.localStorage.getItem('claimTestMode') === '1';

    return queryEnabled || storedEnabled;
  });
  
  const fileInputRef = useRef(null);
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
      
      // Fetch Winnings & Participation
      const { data: winningsData } = await supabase
        .from('draw_winners')
        .select('amount_won')
        .eq('user_id', user.id);
      
      const total = winningsData?.reduce((sum, w) => sum + Number(w.amount_won), 0) || 0;
      setTotalWon(total);

      const { count: scoresCount } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setDrawsEntered(scoresCount || 0);

      const { data: nextDrawData } = await supabase
        .from('draws')
        .select('month')
        .eq('is_open', true)
        .limit(1);
      
      if (nextDrawData && nextDrawData.length > 0) {
        setNextDraw(nextDrawData[0].month);
      } else {
        setNextDraw('TBD');
      }

      // Fetch Pending Proof Winnings
      const { data: pendingData } = await supabase
        .from('draw_winners')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending_proof')
        .limit(1)
        .single();
      
      if (pendingData) {
        setPendingWin(pendingData);
      } else if (isClaimTestMode) {
        setPendingWin(createMockPendingWin());
      } else {
        setPendingWin(null);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user, isClaimTestMode]);

  const enableClaimTestMode = () => {
    window.localStorage.setItem('claimTestMode', '1');
    setIsClaimTestMode(true);
    setPendingWin((currentPendingWin) => currentPendingWin || createMockPendingWin());
  };

  const disableClaimTestMode = () => {
    window.localStorage.removeItem('claimTestMode');
    setIsClaimTestMode(false);
    setPendingWin((currentPendingWin) => (currentPendingWin?.isMock ? null : currentPendingWin));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !pendingWin) return;

    setIsUploading(true);
    
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert('Failed to upload proof. Ensure your file is an image or PDF.');
      setIsUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    if (pendingWin.isMock) {
      alert(`Claim test upload complete.\n\nFile URL: ${publicUrl}`);
      setPendingWin(null);
      setIsUploading(false);
      return;
    }

    // Update draw_winners row
    const { error: updateError } = await supabase
      .from('draw_winners')
      .update({ proof_url: publicUrl, status: 'verified' })
      .eq('id', pendingWin.id);

    if (updateError) {
      console.error("Update error:", updateError);
      alert('Proof uploaded but failed to update the record status.');
    } else {
      alert('Proof submitted successfully! It is now under review by our admin team.');
      setPendingWin(null);
    }
    
    setIsUploading(false);
  };

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

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm("Are you sure you want to delete this score?")) return;
    
    const { error } = await supabase.from('scores').delete().eq('id', scoreId);
    if (!error) {
      setScores(prev => prev.filter(s => s.id !== scoreId));
      setDrawsEntered(prev => Math.max(0, prev - 1));
    } else {
      alert("Failed to delete score.");
    }
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
          {userProfile?.subscription_status === 'active' ? (
            <>
              <div className="text-primary font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Active • Member
              </div>
              <div className="text-xs text-text-muted mt-1 whitespace-nowrap">
                Next Renewal: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </>
          ) : (
            <>
              <div className="text-red-400 font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                </span>
                Inactive
              </div>
              <div className="text-xs text-text-muted mt-1">Upgrade to unlock features</div>
            </>
          )}
        </div>
      </motion.div>

      {userProfile?.subscription_status !== 'active' && !isLoading ? (
        <motion.div variants={itemVariants} className="glass-card text-center py-20 border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full translate-y-20 scale-150 -z-10"></div>
          <span className="text-5xl mb-6 block">🔒</span>
          <h2 className="text-3xl mb-4">Membership Required</h2>
          <p className="text-text-muted max-w-lg mx-auto mb-8">
            The Charity Golf platform requires an active subscription to submit scores, direct charity donations, and participate in the monthly jackpot draws.
          </p>
          <button onClick={() => window.location.href='/subscribe'} className="btn-primary px-8 py-4 text-lg shadow-glow-lg animate-pulse border-none">
            Unlock Dashboard
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
        
        {/* Score Entry & History (2 Cols) */}
        <div className="md:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="glass-card">
            <h3 className="mb-4">Submit a Round</h3>
            <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm text-text-muted mb-1">Date Played</label>
                {pendingWin?.isMock && (
                  <div className="mb-4 rounded-xl border border-primary/20 bg-primary/10 p-3 text-xs text-text-muted">
                    Claim test mode is active. This card is being shown from the frontend without requiring a real winner record first.
                  </div>
                )}

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
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-text-muted">{new Date(score.date).toLocaleDateString()}</div>
                        {idx === 0 && <div className="text-xs text-primary font-bold animate-pulse hidden sm:block">LATEST</div>}
                        <button 
                          onClick={() => handleDeleteScore(score.id)}
                          className="text-text-muted hover:text-red-400 p-1 opacity-50 hover:opacity-100 transition-opacity"
                          title="Delete Score"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
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
                <span className="text-text-muted">Rounds Entered:</span>
                <span className="text-white font-bold">{isLoading ? '...' : drawsEntered}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-muted">Total Won:</span>
                <span className="text-primary font-bold">{isLoading ? '...' : `£${totalWon.toFixed(2)}`}</span>
              </li>
              <li className="flex justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-text-muted">Next Draw:</span>
                <span className="text-white font-bold">{nextDraw}</span>
              </li>
            </ul>
          </motion.div>

          {!pendingWin && (
            <motion.div variants={itemVariants} className="glass-card border border-dashed border-primary/20">
              <h3 className="mb-2">Claim Flow Test</h3>
              <p className="text-sm text-text-muted mb-4">
                No real pending claim was found for this account yet. Use test mode to reach the claim card from the frontend and verify the upload flow.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={enableClaimTestMode}
                  className="btn-primary flex-1 justify-center"
                >
                  Enable Claim Test
                </button>
                {isClaimTestMode && (
                  <button
                    type="button"
                    onClick={disableClaimTestMode}
                    className="btn-ghost flex-1 justify-center"
                  >
                    Disable Test
                  </button>
                )}
              </div>
              <p className="text-xs text-text-muted mt-3">
                You can also open this page with <code>?claimTest=1</code>.
              </p>
            </motion.div>
          )}

          {/* Winnings & Proof Upload */}
          <AnimatePresence>
            {pendingWin && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card border-primary/30 shadow-glow-lg animate-float"
              >
                <h3 className="mb-2 flex items-center gap-2">
                  Claim Winnings
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                </h3>
                <p className="text-xs text-text-muted mb-4">You have an outstanding prize. Verify your latest round to claim.</p>
                
                <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                  <div className="text-sm text-text-muted mb-1">Pending Amount</div>
                  <div className="text-2xl font-bold text-primary">£{pendingWin.amount_won}</div>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*,.pdf" 
                  className="hidden" 
                />

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isUploading}
                  className="btn-primary w-full flex items-center justify-center gap-2" 
                  onClick={() => fileInputRef.current.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {isUploading ? 'Uploading...' : 'Upload Scorecard Proof'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
