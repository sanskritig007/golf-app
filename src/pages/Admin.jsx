import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDraw, calculatePrizePool } from '../utils/drawEngine';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [activeTab, setActiveTab] = useState('draws');
  const [payouts, setPayouts] = useState([]);
  
  // Simulation & Live State
  const [subscribers, setSubscribers] = useState(15000);
  const [simulationResult, setSimulationResult] = useState(null);
  
  const [currentDraw, setCurrentDraw] = useState(null);
  const [drawParticipants, setDrawParticipants] = useState(0);
  const [isRunningOfficial, setIsRunningOfficial] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (data?.is_admin) {
        setIsAdmin(true);
      } else {
        navigate('/dashboard');
      }
      setIsLoadingAuth(false);
    };
    checkAdmin();
  }, [user, navigate]);

  const fetchPayouts = async () => {
    const { data, error } = await supabase
      .from('draw_winners')
      .select('*, draws(month)')
      .order('id', { ascending: false });
    
    if (data) setPayouts(data);
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
    if (isAdmin) {
      if (activeTab === 'charity') fetchPayouts();
      if (activeTab === 'draws') loadDrawStats();
    }
  }, [isAdmin, activeTab]);

  const handleApprovePayout = async (winnerId) => {
    const { error } = await supabase
      .from('draw_winners')
      .update({ status: 'paid' })
      .eq('id', winnerId);
    
    if (!error) {
       fetchPayouts(); // refresh list
    } else {
       alert("Failed to update payout.");
    }
  };

  const runSimulation = (type) => {
    const winningNumbers = generateDraw(type);
    const financials = calculatePrizePool(subscribers);
    
    setSimulationResult({
      type,
      numbers: winningNumbers,
      financials
    });
  };

  const runOfficialDraw = async () => {
    if (!currentDraw) return alert("No open draw found to finalize.");
    if (drawParticipants === 0) return alert("No users found with valid scores.");
    if (!window.confirm(`Are you absolutely sure you want to finalize the ${currentDraw.month} draw? This cannot be undone and will officially publish winners.`)) return;

    setIsRunningOfficial(true);

    try {
      const { data: scoresData } = await supabase.from('scores').select('user_id');
      const uniqueUsers = Array.from(new Set(scoresData.map(s => s.user_id)));

      // Random winner selection
      const shuffled = uniqueUsers.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, Math.max(1, Math.min(3, uniqueUsers.length))); 

      // Simple 50% total pool distribution among winners
      const prizePerWinner = Math.floor((currentDraw.total_pool * 0.5) / winners.length);
      
      const winnerInserts = winners.map(uid => ({
        draw_id: currentDraw.id,
        user_id: uid,
        amount_won: prizePerWinner,
        status: 'pending_proof'
      }));

      const { error: insertError } = await supabase.from('draw_winners').insert(winnerInserts);
      if (insertError) throw insertError;

      const { error: closeError } = await supabase
        .from('draws')
        .update({ is_open: false })
        .eq('id', currentDraw.id);
      
      if (closeError) throw closeError;

      alert(`Successfully finalized draw! ${winners.length} winners selected.`);
      
      // Update UI
      setCurrentDraw(null);
      setSimulationResult(null);
      loadDrawStats();
    } catch (e) {
      console.error(e);
      alert("Error finalizing draw: " + e.message);
    }
    
    setIsRunningOfficial(false);
  };

  if (isLoadingAuth) {
    return <div className="container py-12 text-center text-text-muted animate-pulse">Verifying Security Clearance...</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2>Admin <span className="text-primary">Control Center</span></h2>
        <div className="bg-black/40 rounded-full p-1 border border-white/5 inline-flex">
          <button onClick={() => setActiveTab('draws')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'draws' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Draw Engine</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Users</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Reports</button>
          <button onClick={() => setActiveTab('charity')} className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'charity' ? 'bg-primary text-white' : 'text-text-muted hover:text-white'}`}>Payouts</button>
        </div>
      </div>

      {activeTab === 'draws' && (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="glass-card">
            <h3 className="mb-4 text-red-400">🚨 Official Draw Engine</h3>
            <p className="text-sm text-text-muted mb-6">Execute the live monthly draw algorithm. This strictly queries the `scores` and `draws` tables from Supabase.</p>
            
            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Currently Open Draw:</span>
                <span className="font-bold text-white">{currentDraw ? currentDraw.month : 'None'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Total Prize Pool Confirmed:</span>
                <span className="font-mono text-primary font-bold">{currentDraw ? `£${currentDraw.total_pool}` : '£0.00'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Eligible Participants:</span>
                <span className="font-bold text-white">{drawParticipants} users</span>
              </div>
            </div>

            <button 
              onClick={runOfficialDraw} 
              disabled={isRunningOfficial || !currentDraw || drawParticipants === 0}
              className={`w-full h-[50px] font-bold tracking-wider rounded-xl transition-all duration-300 ${!currentDraw || drawParticipants === 0 ? 'bg-white/5 text-text-muted cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-[1.02]'}`}
            >
              {isRunningOfficial ? 'EXECUTING ALGORITHM...' : 'FINALIZE MONTHLY DRAW'}
            </button>
          </div>

          <div className="glass-card flex flex-col">
            <h3 className="mb-4">Draw Simulation Tool (Dry Run)</h3>
            <p className="text-sm text-text-muted mb-6">Test the algorithms without writing to the database.</p>
            
            <div className="flex gap-4 mb-8">
              <button onClick={() => runSimulation('random')} className="btn-ghost flex-1 text-sm py-2">Run Random</button>
              <button onClick={() => runSimulation('algorithmic')} className="btn-primary flex-1 text-sm py-2">Run Algorithmic</button>
            </div>
            
            {!simulationResult ? (
              <div className="flex-1 flex items-center justify-center text-text-muted border border-dashed border-white/10 rounded-xl text-sm italic">
                Awaiting simulation parameters.
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in bg-black/20 p-4 rounded-xl border border-white/5">
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-2">Winning Combination ({simulationResult.type})</div>
                  <div className="flex gap-2">
                    {simulationResult.numbers.map((num, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center text-sm font-bold shadow-glow">
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white">Simulated Pool Result</span>
                    <span className="font-bold text-primary">£{simulationResult.financials.prizePool.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 className="mb-4">User Management Prototype</h3>
          <p className="text-sm text-text-muted">In a full production environment, this dashboard would map directly to the Supabase <code>profiles</code> table, allowing admins to edit scores and manage subscriptions.</p>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card">
            <h3 className="mb-6">Global Financial Overview</h3>
            <div className="space-y-4">
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-text-muted">Total Revenue (YTD)</div>
                <div className="text-3xl font-bold text-white">£450,210.00</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <div className="text-sm text-primary">Total Charity Distributed</div>
                <div className="text-3xl font-bold text-primary">£120,550.00</div>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="text-sm text-text-muted">Prize Pools Distributed</div>
                <div className="text-3xl font-bold text-white">£135,063.00</div>
              </div>
            </div>
          </div>
          <div className="glass-card">
            <h3 className="mb-6">Active Subscribers</h3>
            <div className="flex items-end gap-4 mb-8">
              <div className="text-5xl font-bold">15,420</div>
              <div className="text-primary font-bold mb-1">+4% this month</div>
            </div>
            
            <h4 className="text-sm uppercase text-text-muted mb-3">Subscription Tiers</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Club Members</span> <span>12,100</span></div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{width: '78%'}}></div></div>
              
              <div className="flex justify-between text-sm mt-4"><span>Founding Members</span> <span>3,320</span></div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: '22%'}}></div></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charity' && (
        <div className="glass-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="m-0">Charity & Winners Payout Tracking</h3>
            <button className="btn-primary text-sm py-2">Export CSV</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-sm uppercase tracking-wider text-text-muted">
                  <th className="font-medium p-4">Winner ID (User)</th>
                  <th className="font-medium p-4">Draw Month</th>
                  <th className="font-medium p-4">Amount</th>
                  <th className="font-medium p-4 text-center">Status</th>
                  <th className="font-medium p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(p => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-xs text-text-muted">{p.user_id.substring(0,12)}...</td>
                    <td className="p-4">{p.draws?.month || 'Unknown'}</td>
                    <td className="p-4 font-mono text-primary font-bold">£{p.amount_won}</td>
                    <td className="p-4 text-center">
                       {p.status === 'pending_proof' && <span className="text-yellow-400 text-sm">● Awaiting Proof</span>}
                       {p.status === 'verified' && <span className="text-blue-400 text-sm">● Under Review</span>}
                       {p.status === 'paid' && <span className="text-primary text-sm">● Paid</span>}
                    </td>
                    <td className="p-4 flex gap-3 text-sm items-center">
                      {p.proof_url ? (
                        <a href={p.proof_url} target="_blank" rel="noreferrer" className="text-text-muted hover:text-white transition-colors">View Receipt</a>
                      ) : (
                        <span className="text-text-muted/50 italic">No proof yet</span>
                      )}
                      
                      {p.status === 'verified' && (
                        <button onClick={() => handleApprovePayout(p.id)} className="text-primary hover:underline font-bold bg-primary/10 px-3 py-1 rounded">Approve & Pay</button>
                      )}
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-text-muted italic bg-black/20">No payout records found in the database.</td>
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
