import { useState, useEffect } from "react";
import IssueCard from "./components/IssueCard";
import StatsPanel from "./components/StatsPanel";
import IssueMap from "./components/IssueMap";
import { PlusCircle, Filter, Search, Download, SortAsc, MapPin, X, Moon, Sun, Bell } from "lucide-react";

// Load initial data with activity logs
const loadInitialData = () => {
  const saved = localStorage.getItem("cityIssues");
  if (saved) return JSON.parse(saved);
  return [
    {
      _id: "1",
      title: "Pothole on Main St.",
      category: "Road Issue",
      status: "Open",
      priority: "High",
      location: "Main St. near 5th Ave.",
      date: "2024-06-15",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      image: null,
      logs: [{ action: "Issue created", timestamp: new Date("2024-06-15").toISOString() }]
    },
    {
      _id: "2",
      title: "Streetlight not working",
      category: "Electricity",
      status: "Pending",
      priority: "Medium",
      location: "Park Avenue",
      date: "2024-06-16",
      coordinates: { lat: 12.9352, lng: 77.6245 },
      image: null,
      logs: [{ action: "Issue created", timestamp: new Date("2024-06-16").toISOString() }]
    },
  ];
};

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Load data from localStorage
  useEffect(() => {
    const data = loadInitialData();
    setIssues(data);
    setLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (issues.length > 0) {
      localStorage.setItem("cityIssues", JSON.stringify(issues));
    }
  }, [issues]);

  // Notification helpers
  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg" });
    }
  };

  // Add new issue
  const handleAddIssue = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newIssue = {
      _id: Date.now().toString(),
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      date: formData.get("date"),
      status: "Open",
      priority: formData.get("priority"),
      coordinates: selectedCoordinates || null,
      image: imagePreview || null,
      logs: [{ action: "Issue created", timestamp: new Date().toISOString() }]
    };
    setIssues([newIssue, ...issues]);
    e.target.reset();
    setSelectedCoordinates(null);
    setImagePreview(null);
    sendNotification("New Issue Reported", `${newIssue.title} - ${newIssue.location}`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    document.getElementById("imageInput").value = "";
  };

  // Update status with log + notification
  const updateStatus = (id, newStatus) => {
    setIssues(issues.map(issue => {
      if (issue._id === id && issue.status !== newStatus) {
        const newLog = {
          action: `Status changed from ${issue.status} to ${newStatus}`,
          timestamp: new Date().toISOString()
        };
        sendNotification(`Issue: ${issue.title}`, newLog.action);
        return {
          ...issue,
          status: newStatus,
          logs: [...(issue.logs || []), newLog]
        };
      }
      return issue;
    }));
  };

  const deleteIssue = (id) => {
    if (confirm("Delete this issue?")) {
      setIssues(issues.filter(issue => issue._id !== id));
    }
  };

  // Filter, search, sort
  let filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === "All" || issue.status === filterStatus;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  filteredIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (sortBy === "priority") {
      const order = { High: 3, Medium: 2, Low: 1 };
      return order[b.priority] - order[a.priority];
    }
    return 0;
  });

  const exportToCSV = () => {
    const headers = ["Title", "Category", "Status", "Priority", "Location", "Date", "Lat", "Lng"];
    const rows = issues.map(issue => [
      issue.title, issue.category, issue.status, issue.priority,
      issue.location, issue.date,
      issue.coordinates?.lat || "", issue.coordinates?.lng || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cityfix_issues_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center p-10">Loading issues...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header with Dark Mode & Notifications */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
          CityFix Dashboard
        </h1>
        <div className="flex gap-3">
          <button
            onClick={requestNotificationPermission}
            className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition"
            title="Enable notifications"
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-700 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Toggle Map/List */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <MapPin size={18} /> {showMap ? "Show List" : "Show Map"}
        </button>
      </div>

      {showMap ? (
        <IssueMap issues={issues} />
      ) : (
        <>
          {/* Form Section with Map Picker & Image Upload */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 text-white">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <PlusCircle /> Report an Issue
              </h2>
              <form onSubmit={handleAddIssue} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input type="text" name="title" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select name="category" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90">
                      <option value="">Select</option>
                      <option value="Road Issue">🛣️ Road Issue</option>
                      <option value="Electricity">⚡ Electricity</option>
                      <option value="Sanitation">🗑️ Sanitation</option>
                      <option value="Water Supply">💧 Water Supply</option>
                      <option value="Public Transport">🚌 Public Transport</option>
                      <option value="Other">📌 Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location (Address)</label>
                    <input type="text" name="location" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="date" name="date" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select name="priority" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90">
                      <option value="High">🔴 High</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Low">🟢 Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Photo (optional)</label>
                    <input id="imageInput" type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />
                    {imagePreview && (
                      <div className="mt-2 relative w-20 h-20">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">📍 Pin location on map (click to select)</label>
                  <div className="h-64 rounded-lg overflow-hidden border-2 border-white/50">
                    <IssueMap 
                      interactive={true}
                      onLocationSelect={(latlng) => setSelectedCoordinates(latlng)}
                      selectedLocation={selectedCoordinates}
                    />
                  </div>
                  {selectedCoordinates && (
                    <p className="text-xs mt-1">Selected: {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}</p>
                  )}
                </div>
                <button type="submit" className="bg-white text-blue-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition shadow-md">
                  Submit Issue
                </button>
              </form>
            </div>
          </div>

          <StatsPanel issues={issues} />

          {/* Toolbar */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search by title/location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex gap-2">
                {["All", "Open", "Pending", "Closed", "In Progress"].map(status => (
                  <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-1 rounded-full text-sm transition ${filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}`}>
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")} className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200">
                <SortAsc size={16} /> Sort by {sortBy === "date" ? "Date" : "Priority"}
              </button>
              <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                <Download size={16} /> Export
              </button>
            </div>
          </div>

          {/* Issue Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">📋 Issues {filteredIssues.length !== issues.length && `(${filteredIssues.length} of ${issues.length})`}</h2>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500">No issues match.</div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredIssues.map(issue => (
                  <IssueCard key={issue._id} {...issue} onStatusChange={updateStatus} onDelete={deleteIssue} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;