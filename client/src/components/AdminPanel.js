import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const handleAddUser = () => {
    fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newUserEmail }),
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setNewUserEmail('');
      });
  };

  const handleDeleteUser = (email) => {
    fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <h3>Authorized Users</h3>
      <ul>
        {users.map((email, index) => (
          <li key={index}>
            {email}
            <button onClick={() => handleDeleteUser(email)}>Delete</button>
          </li>
        ))}
      </ul>
      <h3>Add New User</h3>
      <input
        type="email"
        value={newUserEmail}
        onChange={(e) => setNewUserEmail(e.target.value)}
        placeholder="Enter user email"
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default AdminPanel;
