import React, { useState, useEffect } from 'react';
import './ManageUsersModal.css';

const ManageUsersModal = ({ onClose, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
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

  const handleAddUser = (e) => {
    e.preventDefault();
    fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newUserEmail, isAdmin: newUserIsAdmin }),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to add user.');
        }
      })
      .then(data => {
        setUsers(data);
        setNewUserEmail('');
        setNewUserIsAdmin(false);
      })
      .catch(error => alert('Error adding user: ' + error.message));
  };

  return (
    <div className="manage-users-modal-overlay">
      <div className="manage-users-modal dark">
        <div className="modal-header">
          <h2>Manage Authorized Users</h2>
          <button onClick={onClose} className="close-button">X</button>
        </div>

        <form onSubmit={handleAddUser} className="add-user-form">
          <input
            type="email"
            placeholder="New user email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={newUserIsAdmin}
              onChange={(e) => setNewUserIsAdmin(e.target.checked)}
            />
            Is Admin
          </label>
          <button type="submit">Add User</button>
        </form>

        <ul className="user-list">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li key={index} className="user-item">
                <div>
                  <p className="user-email">{user.email}</p>
                  <p className="user-role">{user.isAdmin ? 'Admin' : 'Regular User'}</p>
                </div>
                <div className="user-actions">
                  {currentUser && currentUser.email !== user.email && (
                    <button
                      onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                      className={user.isAdmin ? 'demote-button' : 'promote-button'}
                    >
                      {user.isAdmin ? 'Demote' : 'Promote'}
                    </button>
                  )}
                  {currentUser && currentUser.email !== user.email && (
                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="no-users">No authorized users found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ManageUsersModal;
