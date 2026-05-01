import { TrendingUp, AlertTriangle, CheckCircle, Clock, Flag } from "lucide-react";

function StatsPanel({ issues }) {
  const total = issues.length;
  const openCount = issues.filter(i => i.status === "Open").length;
  const pendingCount = issues.filter(i => i.status === "Pending").length;
  const closedCount = issues.filter(i => i.status === "Closed").length;
  const highPriorityCount = issues.filter(i => i.priority === "High").length;

  const categoryMap = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(categoryMap), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <TrendingUp className="text-blue-500" /> Live Dashboard
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total" value={total} icon={<TrendingUp size={20} />} color="blue" />
        <StatCard title="Open" value={openCount} icon={<AlertTriangle size={20} />} color="red" />
        <StatCard title="Pending" value={pendingCount} icon={<Clock size={20} />} color="yellow" />
        <StatCard title="Closed" value={closedCount} icon={<CheckCircle size={20} />} color="green" />
        <StatCard title="High Priority" value={highPriorityCount} icon={<Flag size={20} />} color="red" />
      </div>
      <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">📊 Issues by Category</h4>
      <div className="space-y-3">
        {Object.entries(categoryMap).map(([cat, count]) => (
          <div key={cat}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{cat}</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">{count}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${(count / maxCount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
    red: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
    green: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300",
  };
  return (
    <div className={`${colors[color]} rounded-xl p-3 text-center transition hover:scale-105`}>
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium">{title}</div>
    </div>
  );
}

export default StatsPanel;