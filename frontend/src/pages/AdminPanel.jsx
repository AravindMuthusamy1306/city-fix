import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function SkeletonRow() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-12 bg-gray-100 dark:bg-gray-700 rounded mb-2"></div>
    </div>
  );
}

function SkeletonUserTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-3">Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan="5"><SkeletonRow /></td></tr>
        </tbody>
      </table>
    </div>
  );
}

function SkeletonIssueTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white dark:bg-gray-800 rounded-xl shadow">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="p-3">Title</th><th>Category</th><th>Status</th><th>Priority</th><th>User</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan="6"><SkeletonRow /></td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role !== 'admin') return;
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'issues') {
      fetchAllIssues();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_URL}/issues/users`);
      setUsers(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAllIssues = async () => {
    setLoadingIssues(true);
    try {
      const res = await axios.get(`${API_URL}/issues?page=1&limit=100`);
      setAllIssues(res.data.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load issues');
    } finally {
      setLoadingIssues(false);
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
      
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-2 px-2 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 font-semibold text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
        >
          Dashboard
        </button>
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

      {activeTab === 'dashboard' && <AdminDashboard />}

      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <SkeletonUserTable />
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found.</div>
          ) : (
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
          )}
        </div>
      )}

      {activeTab === 'issues' && (
        <div className="overflow-x-auto">
          {loadingIssues ? (
            <SkeletonIssueTable />
          ) : allIssues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No issues found.</div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}