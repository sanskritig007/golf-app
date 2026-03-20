import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Draws from './pages/Draws';
import Subscribe from './pages/Subscribe';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/draws" element={<Draws />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/admin" element={<div className="container"><h2>Admin Panel</h2><p>Restricted access.</p></div>} />
        </Routes>
      </main>
      <footer className="py-10 border-t border-white/5 mt-20">
        <div className="container text-center text-text-muted text-sm">
          &copy; 2026 Golf Charity Platform. All rights reserved.
        </div>
      </footer>
    </Router>
  );
}

export default App;
