import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function StatCard({ title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  };
  return (
    <div className={`${colorClasses[color]} rounded-xl p-4 shadow text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm">{title}</p>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 animate-pulse">
      <div className="h-8 w-16 mx-auto bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="h-4 w-24 mx-auto mt-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`);
      setStats(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!stats) return null;

  // Prepare data for charts
  const categoryData = stats.issuesByCategory.map(item => ({ name: item.category, count: item.count }));
  const trendData = stats.issuesLast7Days.map(item => ({ date: new Date(item.date).toLocaleDateString(), count: Number(item.count) }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h2>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Issues" value={stats.totalIssues} color="blue" />
        <StatCard title="Open" value={stats.openIssues} color="red" />
        <StatCard title="In Progress" value={stats.inProgressIssues} color="yellow" />
        <StatCard title="Pending" value={stats.pendingIssues} color="purple" />
        <StatCard title="Closed" value={stats.closedIssues} color="green" />
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-2">Average Resolution Time</h3>
        <p className="text-3xl font-bold text-green-600">{stats.avgResolutionDays} days</p>
        <p className="text-sm text-gray-500">(for closed issues)</p>
      </div>

      {/* Trend Chart (Last 7 days) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">Issues Reported (Last 7 days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
        <h3 className="text-lg font-semibold mb-4">Issues by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}