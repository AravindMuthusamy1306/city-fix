import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const updateName = async () => {
    try {
      await axios.put(`${API_URL}/user/profile`, { name });
      setMessage('Name updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update name');
      setTimeout(() => setError(''), 3000);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/user/change-password`, {
        currentPassword,
        newPassword
      });
      setMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Profile Settings</h2>
      
      {message && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Update Name</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          onClick={updateName}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Update Name
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Change Password</h3>
        <form onSubmit={changePassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">New Password (min 6 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}