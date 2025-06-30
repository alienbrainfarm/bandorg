import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function AddUsersPage() {
  const [newUsers, setNewUsers] = useState([{ email: '', isAdmin: false }]);

  const handleAddUserField = () => {
    setNewUsers([...newUsers, { email: '', isAdmin: false }]);
  };

  const handleUserChange = (index, field, value) => {
    const updatedUsers = [...newUsers];
    updatedUsers[index][field] = value;
    setNewUsers(updatedUsers);
  };

  const handleSubmit = async () => {
    try {
      const responses = await Promise.all(
        newUsers.map(async user => {
          const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
          });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
      );

      const data = responses;
      console.log('Users added:', data);
      alert('Users added successfully!');
      setNewUsers([{ email: '', isAdmin: false }]); // Reset form
    } catch (error) {
      console.error('Error adding users:', error);
      alert('Error adding users: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Users</h2>
      {newUsers.map((user, index) => (
        <div key={index} className="flex items-center space-x-4 mb-2">
          <input
            type="email"
            placeholder="User Email"
            value={user.email}
            onChange={(e) => handleUserChange(index, 'email', e.target.value)}
            className="border p-2 rounded flex-grow"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={user.isAdmin}
              onChange={(e) => handleUserChange(index, 'isAdmin', e.target.checked)}
              className="form-checkbox"
            />
            <span>Admin Rights</span>
          </label>
        </div>
      ))}
      <button
        onClick={handleAddUserField}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
      >
        + Add Another User
      </button>
      <button
        onClick={handleSubmit}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit All Users
      </button>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:underline">Back to Calendar</Link>
      </div>
    </div>
  );
}

export default AddUsersPage;
