import { useState } from "react";
import { MapPin, Calendar, Tag, CheckCircle, PlayCircle, Trash2, Flag, ExternalLink, History } from "lucide-react";

function IssueCard({ _id, title, category, status, priority, location, date, image, coordinates, logs = [], onStatusChange, onDelete }) {
  const [showLogs, setShowLogs] = useState(false);
  
  const statusConfig = {
    Open: { color: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300", icon: "🔴" },
    Pending: { color: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300", icon: "🟡" },
    "In Progress": { color: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300", icon: "🔵" },
    Closed: { color: "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300", icon: "✅" },
  };
  const priorityConfig = {
    High: { color: "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100", icon: "🔴" },
    Medium: { color: "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100", icon: "🟡" },
    Low: { color: "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100", icon: "🟢" },
  };
  const statusStyle = statusConfig[status] || statusConfig.Open;
  const priorityStyle = priorityConfig[priority] || priorityConfig.Medium;

  const openMap = () => {
    if (coordinates?.lat && coordinates?.lng) {
      window.open(`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=15/${coordinates.lat}/${coordinates.lng}`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, "_blank");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 overflow-hidden">
      {image && (
        <div className="h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{title}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${priorityStyle.color}`}>
            <Flag size={12} /> {priority}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <Tag size={12} /> {category}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
            {statusStyle.icon} {status}
          </span>
        </div>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p className="flex items-center gap-1"><MapPin size={14} /> {location}</p>
          <p className="flex items-center gap-1"><Calendar size={14} /> {date}</p>
        </div>

        {logs && logs.length > 0 && (
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
          >
            <History size={12} /> {showLogs ? "Hide history" : "Show history"} ({logs.length})
          </button>
        )}
        {showLogs && (
          <div className="mb-3 max-h-32 overflow-y-auto text-xs bg-gray-50 dark:bg-gray-900/50 rounded p-2 space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} className="border-b border-gray-200 dark:border-gray-700 last:border-0 py-1">
                <span className="text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</span> – {log.action}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {status !== "Closed" && (
            <button onClick={() => onStatusChange(_id, "Closed")}
              className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-md text-sm transition">
              <CheckCircle size={16} /> Close
            </button>
          )}
          {status !== "Closed" && status !== "In Progress" && (
            <button onClick={() => onStatusChange(_id, "In Progress")}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded-md text-sm transition">
              <PlayCircle size={16} /> Start
            </button>
          )}
          <button onClick={openMap}
            className="p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition"
            title="View on map">
            <ExternalLink size={16} />
          </button>
          <button onClick={() => onDelete(_id)}
            className="p-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 rounded-md transition">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;