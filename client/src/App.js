import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MyCalendar from './components/Calendar';
import AddUsersPage from './pages/AddUsersPage';
import ManageUsersPage from './pages/ManageUsersPage';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/current_user')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen py-2">
        <header className="bg-gray-800 w-full p-4 text-white">
          <h1>Band Calendar Hub</h1>
          <nav className="flex justify-between items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">Welcome, {user.email}</span>
                {user.isAdmin && (
                  <Link to="/manage-users" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Logout</button>
              </div>
            ) : (
              <button onClick={handleLogin}>Login with Google</button>
            )}
          </nav>
        </header>
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={user ? <MyCalendar user={user} /> : <p>Please log in to view the calendar.</p>} />
            <Route path="/add-users" element={user && user.isAdmin ? <AddUsersPage /> : <p>Access Denied</p>} />
            <Route path="/manage-users" element={user && user.isAdmin ? <ManageUsersPage currentUser={user} /> : <p>Access Denied</p>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;