import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginMockUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { isSupabaseConfigured } = await import('../utils/supabase');
    if (!isSupabaseConfigured) {
      loginMockUser();
      navigate('/dashboard');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="container max-w-md py-20 animate-fade-in">
      <div className="glass-card">
        <h2 className="text-center mb-6">Welcome <span className="text-primary">Back</span></h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary justify-center mt-2 w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Join the club</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
