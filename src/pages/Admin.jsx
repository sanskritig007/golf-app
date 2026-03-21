import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDraw, calculatePrizePool, runTieredDraw } from '../utils/drawEngine';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('draws');
  
  // Payouts State
  const [payouts, setPayouts] = useState([]);
  
  // Users CMS State
  const [usersList, setUsersList] = useState([]);
  
  // Charity CMS State
  const [charitiesList, setCharitiesList] = useState([]);
  const [newCharityName, setNewCharityName] = useState('');
  
  // Analytics State
  const [activeSubsCount, setActiveSubsCount] = useState(15420); // Fallback

  // Simulation & Live State
  const [subscribers, setSubscribers] = useState(15000);
  const [simulationResult, setSimulationResult] = useState(null);
  
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawParticipants, setDrawParticipants] = useState(0);
  const [isRunningOfficial, setIsRunningOfficial] = useState(false);
  const [officialDrawType, setOfficialDrawType] = useState('random');


  const fetchPayouts = async () => {
    const { data, error } = await supabase
      .from('draw_winners')
      .select('*, draws(month)')
      .order('id', { ascending: false });
    if (data) setPayouts(data);
  };

  const fetchUsersList = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, scores(id, value, date)')
      .order('created_at', { ascending: false });
    if (data) setUsersList(data);
  };

  const fetchCharitiesList = async () => {
    const { data } = await supabase.from('charities').select('*').order('name');
    if (data) setCharitiesList(data);
  };

  const loadAnalytics = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active');
    
    if (count !== null) setActiveSubsCount(count);
  };

  const loadDrawStats = async () => {
    const { data: drawData } = await supabase.from('draws').select('*').eq('is_open', true).limit(1).maybeSingle();
    if (drawData) setCurrentDraw(drawData);

    const { data: scoresData } = await supabase.from('scores').select('user_id');
    if (scoresData) {
      const distinctUsers = new Set(scoresData.map(s => s.user_id));
      setDrawParticipants(distinctUsers.size);
    }
  };

  useEffect(() => {
    if (activeTab === 'payouts') fetchPayouts();
    if (activeTab === 'draws') loadDrawStats();
    if (activeTab === 'users') fetchUsersList();
    if (activeTab === 'charities') fetchCharitiesList();
    if (activeTab === 'analytics') loadAnalytics();
  }, [activeTab]);

  // -- Actions --

  const handleApprovePayout = async (winnerId) => {
    const { error } = await supabase.from('draw_winners').update({ status: 'paid' }).eq('id', winnerId);
    if (!error) fetchPayouts();
    else alert("Failed to update payout.");
  };

  const handleRejectPayout = async (winnerId) => {
    if (!window.confirm("Are you sure you want to reject this proof? The user will have to re-upload their scorecard.")) return;
    const { error } = await supabase.from('draw_winners').update({ status: 'pending_proof', proof_url: null }).eq('id', winnerId);
    if (!error) fetchPayouts();
    else alert("Failed to reject payout.");
  };

  const toggleUserSubscription = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await supabase.from('profiles').update({ subscription_status: newStatus }).eq('id', userId);
    fetchUsersList();
  };

  const clearUserScores = async (userId) => {
    if (!window.confirm("Are you sure you want to hard-delete all scores for this user?")) return;
    await supabase.from('scores').delete().eq('user_id', userId);
    fetchUsersList();
  };

  const handleCreateCharity = async (e) => {
    e.preventDefault();
    if (!newCharityName.trim()) return;
    
    const { error } = await supabase.from('charities').insert({ name: newCharityName });
    if (!error) {
      setNewCharityName('');
      fetchCharitiesList();
    } else {
      console.error(error);
      alert(`Failed to create charity: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleDeleteCharity = async (id) => {
    if (!window.confirm("Delete this charity? Profiles linked to this charity may break.")) return;
    const { error } = await supabase.from('charities').delete().eq('id', id);
    if (!error) {
      fetchCharitiesList();
    } else {
      console.error(error);
      alert(`Failed to delete charity: ${error.message || JSON.stringify(error)}`);
    }
  };

  const runSimulation = (type) => {
    const winningNumbers = generateDraw(type);
    const financials = calculatePrizePool(subscribers);
    setSimulationResult({ type, numbers: winningNumbers, financials });
  };

  const runOfficialDraw = async () => {
    if (!currentDraw) return alert("No open draw found to finalize.");
    if (drawParticipants === 0) return alert("No users found with valid scores.");
    if (!window.confirm(`Are you sure you want to execute a ${officialDrawType.toUpperCase()} logic draw? This cannot be undone.`)) return;

    setIsRunningOfficial(true);

    try {
      const { data: scoresData } = await supabase.from('scores').select('user_id, value');
      
      const userScoreMap = {};
      scoresData.forEach(({ user_id, value }) => {
        if (!userScoreMap[user_id]) userScoreMap[user_id] = [];
        userScoreMap[user_id].push(value);
      });
      const usersWithScores = Object.entries(userScoreMap).map(([user_id, scores]) => ({ user_id, scores }));

      const jackpotRollover = currentDraw.jackpot_rollover || 0;
      // Pass the Admin's selected logic type to the engine
      const result = runTieredDraw(usersWithScores, currentDraw.total_pool, jackpotRollover, officialDrawType);

      const allWinners = [...result.tier5winners, ...result.tier4winners, ...result.tier3winners];

      if (allWinners.length > 0) {
        const winnerInserts = allWinners.map(w => ({
          draw_id: currentDraw.id,
          user_id: w.user_id,
          amount_won: w.amount_won,
          status: 'pending_proof',
          match_tier: w.tier,
        }));
        const { error: insertError } = await supabase.from('draw_winners').insert(winnerInserts);
        if (insertError) throw insertError;
      }

      const { error: closeError } = await supabase
        .from('draws')
        .update({ is_open: false, winning_draw: result.winningDrawFormatted })
        .eq('id', currentDraw.id);
      if (closeError) throw closeError;

      if (result.jackpotRolledOver && result.nextJackpotRollover > 0) {
        const { data: updatedDraws } = await supabase.from('draws').update({ jackpot_rollover: result.nextJackpotRollover })
          .eq('is_open', true)
          .neq('id', currentDraw.id)
          .select();
          
        if (!updatedDraws || updatedDraws.length === 0) {
          const nextMonthDate = new Date();
          nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
          const nextMonthString = nextMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
          
          await supabase.from('draws').insert({
            month: nextMonthString,
            total_pool: currentDraw.total_pool,
            is_open: true,
            jackpot_rollover: result.nextJackpotRollover
          });
        }
      }

      const tierSummary = [
        result.tier5winners.length > 0 ? `${result.tier5winners.length} Jackpot winner(s)` : null,
        result.tier4winners.length > 0 ? `${result.tier4winners.length} 4-Match winner(s)` : null,
        result.tier3winners.length > 0 ? `${result.tier3winners.length} 3-Match winner(s)` : null,
      ].filter(Boolean).join(', ');

      const rolloverMsg = result.jackpotRolledOver 
        ? `\n\n⚠️ No 5-match winner! Jackpot of £${result.distributions.match5.toFixed(2)} rolls over.`
        : '';

      alert(`Draw finalized!\nWinning Numbers: ${result.winningDrawFormatted}\n${tierSummary || 'No match winners this draw.'}${rolloverMsg}`);

      setCurrentDraw(null);
      setSimulationResult(null);
      loadDrawStats();
    } catch (e) {
      console.error(e);
      alert("Error finalizing draw: " + e.message);
    }

    setIsRunningOfficial(false);
  };


  return (
    <div className="container py-12 animate-fade-in min-h-[90vh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="mb-0">Admin <span className="text-primary italic">Control Center</span></h2>
        
        {/* Navigation Tabs */}
        <div className="bg-black/40 rounded-full p-1 border border-white/5 inline-flex overflow-x-auto max-w-full scrollbar-hide">
          <button onClick={() => setActiveTab('draws')} className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'draws' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>Draw Engine</button>
          <button onClick={() => setActiveTab('users')} className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>Users</button>
          <button onClick={() => setActiveTab('charities')} className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'charities' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>Charity CMS</button>
          <button onClick={() => setActiveTab('payouts')} className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'payouts' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>Verification</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 md:px-6 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-primary text-black' : 'text-text-muted hover:text-white'}`}>Analytics</button>
        </div>
      </div>

      {activeTab === 'draws' && (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="glass-card">
            <h3 className="mb-4 text-red-500 font-bold">🚨 Official Monthly Draw</h3>
            <p className="text-sm text-text-muted mb-6">Executes the live matchmaking algorithm against user databases.</p>
            
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Target Month:</span>
                <span className="font-bold text-white">{currentDraw ? currentDraw.month : 'No Open Draw'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Prize Pool Size:</span>
                <span className="font-mono text-primary font-bold">{currentDraw ? `£${currentDraw.total_pool}` : '£0'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Live Participants:</span>
                <span className="font-bold text-white">{drawParticipants} users</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-text-muted mb-2 font-bold uppercase tracking-wider">Algorithm Engine Selector</label>
              <select 
                value={officialDrawType} 
                onChange={e => setOfficialDrawType(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm font-semibold"
              >
                <option value="random">True Random Distribution</option>
                <option value="algorithmic">Algorithmic Match Weights</option>
              </select>
            </div>

            <button 
              onClick={runOfficialDraw} 
              disabled={isRunningOfficial || !currentDraw || drawParticipants === 0}
              className={`w-full h-[55px] font-bold tracking-widest uppercase rounded-xl transition-all duration-300 ${!currentDraw || drawParticipants === 0 ? 'bg-white/5 text-text-muted cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-[1.02]'}`}
            >
              {isRunningOfficial ? 'Calculating...' : 'Execute Live Draw'}
            </button>
          </div>

          <div className="glass-card flex flex-col">
            <h3 className="mb-4">Sandbox Simulation</h3>
            <p className="text-sm text-text-muted mb-6">Test algorithms locally without database mutations.</p>
            
            <div className="flex gap-4 mb-8">
              <button onClick={() => runSimulation('random')} className="btn-ghost flex-1 text-sm py-2 hover:bg-white/10 border border-white/10">Dry Run Random</button>
              <button onClick={() => runSimulation('algorithmic')} className="btn-primary flex-1 text-sm py-2">Dry Run Algorithmic</button>
            </div>
            
            {!simulationResult ? (
              <div className="flex-1 flex items-center justify-center text-text-muted border border-dashed border-white/10 rounded-xl text-sm italic h-40">
                Awaiting dry run parameters.
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Winning Combination ({simulationResult.type})</div>
                  <div className="flex gap-2 flex-wrap">
                    {simulationResult.numbers.map((num, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-sm font-bold shadow-glow">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Tier Breakdown</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400 font-bold">🏆 5-Match (40%)</span>
                    <span className="font-mono text-white">£{simulationResult.financials.distributions.match5.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary font-bold">🥈 4-Match (35%)</span>
                    <span className="font-mono text-white">£{simulationResult.financials.distributions.match4.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-400 font-bold">🥉 3-Match (25%)</span>
                    <span className="font-mono text-white">£{simulationResult.financials.distributions.match3.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card animate-fade-in min-h-[60vh]">
          <h3 className="mb-6 font-bold flex items-center gap-3">User Management Directory</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/60 border-b border-primary/20 text-xs uppercase tracking-widest text-text-muted">
                  <th className="font-medium p-4">Player Details</th>
                  <th className="font-medium p-4">Subscription</th>
                  <th className="font-medium p-4">Active Scores</th>
                  <th className="font-medium p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{u.fullName || 'Anonymous'}</div>
                      <div className="font-mono text-xs text-text-muted/60 mt-1">{u.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${u.subscription_status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                        {u.subscription_status?.toUpperCase() || 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.scores && u.scores.length > 0 ? u.scores.map(s => (
                          <span key={s.id} className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/80">{s.value}</span>
                        )) : <span className="text-xs text-text-muted italic">No scores</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right space-x-2">
                       <button onClick={() => toggleUserSubscription(u.id, u.subscription_status)} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors">
                         Toggle Sub
                       </button>
                       <button onClick={() => clearUserScores(u.id)} className="text-xs font-bold text-white bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 px-3 py-1.5 rounded transition-colors">
                         Clear Scores
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'charities' && (
        <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
          <div className="md:col-span-1 glass-card h-fit">
            <h3 className="mb-4">Add Global Charity</h3>
            <form onSubmit={handleCreateCharity} className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-wider mb-2">Organization Name</label>
                <input 
                  type="text" 
                  required
                  value={newCharityName}
                  onChange={e => setNewCharityName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary text-sm"
                  placeholder="e.g. The Ocean Cleanup"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-sm">Register Charity Entity</button>
            </form>
          </div>

          <div className="md:col-span-2 glass-card">
             <h3 className="mb-6">Charity Roster (CMS)</h3>
             <div className="space-y-3">
               {charitiesList.map(c => (
                 <div key={c.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-xl hover:border-primary/30 transition-colors">
                   <div>
                     <div className="font-bold text-white text-lg">{c.name}</div>
                     <div className="text-xs text-text-muted font-mono mt-1">ID: {c.id}</div>
                   </div>
                   <button onClick={() => handleDeleteCharity(c.id)} className="text-red-400 hover:text-red-300 font-bold text-sm bg-red-400/10 px-4 py-2 rounded-lg transition-colors">
                     Delete
                   </button>
                 </div>
               ))}
               {charitiesList.length === 0 && <div className="text-center text-text-muted py-8">No charities in the database.</div>}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="glass-card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h3 className="mb-6 z-10 relative">Global Financial Overview</h3>
            <div className="space-y-4 z-10 relative">
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 backdrop-blur-md hover:border-white/20 transition-colors">
                <div className="text-sm text-text-muted font-semibold uppercase tracking-wider mb-1">Total Revenue (YTD)</div>
                <div className="text-4xl font-black text-white font-heading">£450,210.00</div>
              </div>
              <div className="bg-primary/20 p-5 rounded-xl border border-primary/30 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <div className="text-sm text-primary font-bold uppercase tracking-wider mb-1">Total Charity Distributed</div>
                <div className="text-4xl font-black text-primary font-heading">£120,550.00</div>
              </div>
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 backdrop-blur-md">
                <div className="text-sm text-text-muted font-semibold uppercase tracking-wider mb-1">Prize Pools Deposited</div>
                <div className="text-4xl font-black text-white font-heading">£135,063.00</div>
              </div>
            </div>
          </div>
          
          <div className="glass-card flex flex-col justify-between">
            <div>
              <h3 className="mb-6 font-bold text-primary">Live Platform Metrics</h3>
              <div className="flex items-end gap-4 mb-1 border-b border-white/10 pb-6">
                <div className="text-6xl font-black font-heading text-white">{activeSubsCount.toLocaleString()}</div>
                <div className="text-primary font-bold mb-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l1.293 1.293L13.586 7H12z" clipRule="evenodd" /></svg>
                  Live Subscribers
                </div>
              </div>
              
              <h4 className="text-xs uppercase text-text-muted font-bold tracking-widest mt-6 mb-4">Database Activity</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm p-3 bg-black/30 rounded-lg">
                  <span className="text-text-muted">Total Processed Draws</span> 
                  <span className="font-bold text-white font-mono">14 Months</span>
                </div>
                <div className="flex justify-between items-center text-sm p-3 bg-black/30 rounded-lg">
                  <span className="text-text-muted">Avg. Match Accuracy</span> 
                  <span className="font-bold text-primary font-mono">2.4 / 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div className="glass-card animate-fade-in min-h-[60vh]">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h3 className="m-0 text-yellow-400 font-bold flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Winner Verification Tracker
            </h3>
            <button className="btn-ghost border border-white/10 text-sm py-2 px-4 hover:bg-white/5 transition-colors">Export CSV Audit Line</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/60 border-b border-white/10 text-xs uppercase tracking-widest text-text-muted">
                  <th className="font-medium p-4">Winner ID (User)</th>
                  <th className="font-medium p-4">Draw Context</th>
                  <th className="font-medium p-4">Allocated Value</th>
                  <th className="font-medium p-4 text-center">Verification Status</th>
                  <th className="font-medium p-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-xs text-text-muted">{p.user_id.substring(0,12)}...</td>
                    <td className="p-4 text-sm font-semibold">{p.draws?.month || 'Unknown'}</td>
                    <td className="p-4 font-mono text-primary font-bold">£{p.amount_won}</td>
                    <td className="p-4 text-center">
                       {p.status === 'pending_proof' && <span className="text-yellow-400/80 bg-yellow-400/10 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/20">AWAITING UPLOAD</span>}
                       {p.status === 'verified' && <span className="text-blue-400/80 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-bold border border-blue-400/20 animate-pulse">UNDER REVIEW</span>}
                       {p.status === 'paid' && <span className="text-primary/80 bg-primary/10 px-3 py-1 rounded-full text-xs font-bold border border-primary/20">PAID & SETTLED</span>}
                    </td>
                    <td className="p-4 flex gap-2 text-sm items-center justify-end">
                      {p.proof_url ? (
                        <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-primary border border-primary/30 hover:bg-primary/10 px-3 py-1.5 rounded transition-colors text-xs font-bold whitespace-nowrap">View Receipt</a>
                      ) : (
                        <span className="text-text-muted/40 italic text-xs px-2">No proof uploaded</span>
                      )}
                      
                      {p.status === 'verified' && (
                        <>
                          <button onClick={() => handleApprovePayout(p.id)} className="text-black bg-primary hover:bg-primary/80 px-4 py-1.5 rounded transition-colors font-bold whitespace-nowrap shadow-glow ml-2">Approve</button>
                          <button onClick={() => handleRejectPayout(p.id)} className="text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 px-4 py-1.5 rounded transition-colors font-bold whitespace-nowrap">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-text-muted italic bg-black/20 border-b border-white/5">No payout verification records found in the database layer.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
