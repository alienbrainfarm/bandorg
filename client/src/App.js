import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CustomCalendar from './components/Calendar';
import ManageUsersModal from './components/ManageUsersModal';
import LogoutSuccessPage from './pages/LogoutSuccessPage';
import DayView from './pages/DayView';
import WeekView from './pages/WeekView';
import YearView from './pages/YearView';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    fetch('/api/current_user')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleLogout = () => {
    window.location.href = '/logout-success';
  };

  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
        
        <main className="flex-grow p-4 w-full">
          {user ? (
            <Routes>
              <Route path="/" element={<CustomCalendar user={user} />} />
              
              <Route path="/day" element={<DayView user={user} />} />
              <Route path="/week" element={<WeekView user={user} />} />
              <Route path="/year" element={<YearView user={user} />} />
            </Routes>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-4xl font-bold mb-8">Band Calendar Hub</h1>
              <p className="mb-4">Please log in to view the calendar.</p>
              <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Login with Google</button>
            </div>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;