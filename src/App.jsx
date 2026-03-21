import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Draws from './pages/Draws';
import Subscribe from './pages/Subscribe';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public route */}
            <Route path="/" element={<Landing />} />
            
            {/* Guest-only routes (redirects to dashboard if logged in) */}
            <Route element={<ProtectedRoute isProtected={false} />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected routes (requires login) */}
            <Route element={<ProtectedRoute isProtected={true} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/draws" element={<Draws />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </main>
        <footer className="py-10 border-t border-white/5 mt-20">
          <div className="container text-center text-text-muted text-sm">
            &copy; 2026 Golf Charity Platform. All rights reserved.
          </div>
        </footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
