import React, { useState, useEffect } from 'react';

const AdminPanel = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);

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
      body: JSON.stringify({ email: newUserEmail, isAdmin: newUserIsAdmin }),
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setNewUserEmail('');
        setNewUserIsAdmin(false);
      })
      .catch(error => alert('Error adding user: ' + error.message));
  };

  const handleToggleAdmin = (email, currentIsAdmin) => {
    fetch('/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, isAdmin: !currentIsAdmin }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to update user admin status.');
        }
      })
      .then(data => setUsers(data))
      .catch(error => alert('Error updating admin status: ' + error.message));
  };

  const handleDeleteUser = (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Failed to delete user.');
          }
        })
        .then(data => setUsers(data))
        .catch(error => alert('Error deleting user: ' + error.message));
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <h3>Authorized Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            {user.email} {user.isAdmin ? '(Admin)' : ''}
            {currentUser && currentUser.email !== user.email && (
              <button onClick={() => handleToggleAdmin(user.email, user.isAdmin)}>
                {user.isAdmin ? 'Demote' : 'Promote to Admin'}
              </button>
            )}
            {currentUser && currentUser.email !== user.email && (
              <button onClick={() => handleDeleteUser(user.email)} className="delete-button">
                Delete
              </button>
            )}
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
      <label>
        <input
          type="checkbox"
          checked={newUserIsAdmin}
          onChange={(e) => setNewUserIsAdmin(e.target.checked)}
        />
        Is Admin
      </label>
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default AdminPanel;