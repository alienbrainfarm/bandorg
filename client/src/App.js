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
    <div className="App">
      <header className="App-header">
        <h1>Band Calendar Hub</h1>
        <nav>
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button onClick={handleLogin}>Login with Google</button>
          )}
        </nav>
      </header>
      <main>
        {user ? (
          <>
            <MyCalendar />
            {user.isAdmin && <AdminPanel />}
          </>
        ) : (
          <p>Please log in to view the calendar.</p>
        )}
      </main>
    </div>
  );
}

export default App;