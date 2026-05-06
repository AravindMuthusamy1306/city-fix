import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchAllIssues();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/issues/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchAllIssues = async () => {
    try {
      const res = await axios.get(`${API_URL}/issues?page=1&limit=100`);
      setAllIssues(res.data.data);
    } catch (err) {
      console.error('Failed to fetch all issues', err);
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await axios.patch(`${API_URL}/issues/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to change role');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin Panel</h2>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          User Management
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-2 px-2 ${activeTab === 'issues' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          All Issues
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b dark:border-gray-700">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                      className="border rounded p-1 dark:bg-gray-700"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {allIssues.map(issue => (
                <tr key={issue.id} className="border-b dark:border-gray-700">
                  <td className="p-3">{issue.title}</td>
                  <td className="p-3">{issue.category}</td>
                  <td className="p-3">{issue.status}</td>
                  <td className="p-3">{issue.priority}</td>
                  <td className="p-3">{issue.user?.name || 'Unknown'}</td>
                  <td className="p-3">{new Date(issue.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}