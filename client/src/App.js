import React, { useState, useEffect } from 'react';
import MyCalendar from './components/Calendar';
import AdminPanel from './components/AdminPanel';
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
    <div className="flex flex-col items-center min-h-screen py-2">
      <header className="bg-gray-800 w-full p-4 text-white">
        <h1>Band Calendar Hub</h1>
        <nav className="flex justify-between items-center">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">Welcome, {user.email}</span>
              <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Logout</button>
            </>
          ) : (
            <button onClick={handleLogin}>Login with Google</button>
          )}
        </nav>
      </header>
      <main className="flex-grow p-4">
        {user ? (
          <>
            <MyCalendar user={user} />
            {user.isAdmin && <AdminPanel currentUser={user} />}
          </>
        ) : (
          <p>Please log in to view the calendar.</p>
        )}
      </main>
    </div>
  );
}

export default App;