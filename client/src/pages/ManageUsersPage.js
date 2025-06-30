import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ManageUsersPage = ({ currentUser }) => {
  const [users, setUsers] = useState([]);

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

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Authorized Users</h2>
      <div className="mb-4">
        <Link to="/add-users" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Users
        </Link>
      </div>
      <ul className="bg-white shadow overflow-hidden sm:rounded-md divide-y divide-gray-200">
        {users.length > 0 ? (
          users.map((user, index) => (
            <li key={index} className="px-4 py-4 sm:px-6 flex justify-between items-center">
              <div>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-500">{user.isAdmin ? 'Admin' : 'Regular User'}</p>
              </div>
              <div className="space-x-2">
                {currentUser && currentUser.email !== user.email && (
                  <button
                    onClick={() => handleToggleAdmin(user.email, user.isAdmin)}
                    className={`py-1 px-3 rounded text-white text-sm ${user.isAdmin ? 'bg-yellow-500 hover:bg-yellow-700' : 'bg-purple-500 hover:bg-purple-700'}`}
                  >
                    {user.isAdmin ? 'Demote' : 'Promote to Admin'}
                  </button>
                )}
                {currentUser && currentUser.email !== user.email && (
                  <button
                    onClick={() => handleDeleteUser(user.email)}
                    className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="px-4 py-4 sm:px-6 text-gray-500">No authorized users found.</li>
        )}
      </ul>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:underline">Back to Calendar</Link>
      </div>
    </div>
  );
};

export default ManageUsersPage;
