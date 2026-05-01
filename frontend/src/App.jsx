import { useState, useEffect } from "react";
import axios from "axios";
import IssueCard from "./components/IssueCard";
import StatsPanel from "./components/StatsPanel";
import IssueMap from "./components/IssueMap";
import { PlusCircle, Filter, Search, Download, SortAsc, MapPin, X, Moon, Sun, Bell } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/issues";

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [showMap, setShowMap] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(API_URL);
      setIssues(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission !== "granted") Notification.requestPermission();
  };
  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body });
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newIssue = {
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      date: formData.get("date"),
      priority: formData.get("priority"),
      coordinates: selectedCoordinates,
      image: imagePreview,
      logs: [{ action: "Issue created", timestamp: new Date().toISOString() }]
    };
    try {
      const res = await axios.post(API_URL, newIssue);
      setIssues([res.data, ...issues]);
      e.target.reset();
      setSelectedCoordinates(null);
      setImagePreview(null);
      sendNotification("New Issue Reported", `${newIssue.title} - ${newIssue.location}`);
    } catch (err) {
      alert("Error adding issue.");
    }
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

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(`${API_URL}/${id}`, { status: newStatus });
      setIssues(issues.map(issue => issue.id === id ? res.data : issue));
      const issue = issues.find(i => i.id === id);
      if (issue) sendNotification(`Issue: ${issue.title}`, `Status changed to ${newStatus}`);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const deleteIssue = async (id) => {
    if (!confirm("Delete this issue?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setIssues(issues.filter(issue => issue.id !== id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

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
      issue.location, issue.date, issue.lat || "", issue.lng || ""
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cityfix_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">CityFix Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={requestNotificationPermission} className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600"><Bell size={20} /></button>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">{darkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}</button>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => setShowMap(!showMap)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><MapPin size={18} /> {showMap ? "Show List" : "Show Map"}</button>
      </div>

      {showMap ? (
        <IssueMap issues={issues} />
      ) : (
        <>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 text-white">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2"><PlusCircle /> Report an Issue</h2>
              <form onSubmit={handleAddIssue} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium">Title</label><input type="text" name="title" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" /></div>
                  <div><label className="block text-sm font-medium">Category</label><select name="category" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90"><option value="">Select</option><option value="Road Issue">🛣️ Road Issue</option><option value="Electricity">⚡ Electricity</option><option value="Sanitation">🗑️ Sanitation</option><option value="Water Supply">💧 Water Supply</option><option value="Public Transport">🚌 Public Transport</option><option value="Other">📌 Other</option></select></div>
                  <div><label className="block text-sm font-medium">Location (Address)</label><input type="text" name="location" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" /></div>
                  <div><label className="block text-sm font-medium">Date</label><input type="date" name="date" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90" /></div>
                  <div><label className="block text-sm font-medium">Priority</label><select name="priority" required className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white/90"><option value="High">🔴 High</option><option value="Medium">🟡 Medium</option><option value="Low">🟢 Low</option></select></div>
                  <div><label className="block text-sm font-medium">Photo (optional)</label><input id="imageInput" type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" />{imagePreview && (<div className="mt-2 relative w-20 h-20"><img src={imagePreview} className="w-full h-full object-cover rounded" /><button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"><X size={12} /></button></div>)}</div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-2">📍 Pin location on map (click to select)</label>
                  <div className="h-64 rounded-lg overflow-hidden border-2 border-white/50">
                    <IssueMap interactive={true} onLocationSelect={setSelectedCoordinates} selectedLocation={selectedCoordinates} />
                  </div>
                  {selectedCoordinates && <p className="text-xs mt-1">Selected: {selectedCoordinates.lat.toFixed(4)}, {selectedCoordinates.lng.toFixed(4)}</p>}
                </div>
                <button type="submit" className="bg-white text-blue-700 font-bold px-6 py-2 rounded-lg hover:bg-gray-100 transition">Submit Issue</button>
              </form>
            </div>
          </div>

          <StatsPanel issues={issues} />

          <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative"><Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-700" /></div>
              <div className="flex gap-2">{["All","Open","Pending","Closed","In Progress"].map(s => (<button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1 rounded-full text-sm transition ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>{s}</button>))}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy(sortBy === "date" ? "priority" : "date")} className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"><SortAsc size={16} /> Sort by {sortBy === "date" ? "Date" : "Priority"}</button>
              <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm"><Download size={16} /> Export</button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">📋 Issues</h2>
            {filteredIssues.length === 0 ? <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-xl">No issues found.</div> : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredIssues.map(issue => <IssueCard key={issue.id} {...issue} onStatusChange={updateStatus} onDelete={deleteIssue} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;