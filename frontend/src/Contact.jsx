import { Phone, Shield, AlertTriangle, Heart, Home, Car, Wifi, Flower2 } from "lucide-react";

const emergencyNumbers = [
  { name: "National Emergency", number: "112", icon: <Phone size={18} /> },
  { name: "Police", number: "100", icon: <Shield size={18} /> },
  { name: "Fire", number: "101", icon: <AlertTriangle size={18} /> },
  { name: "Ambulance", number: "102", icon: <Heart size={18} /> },
  { name: "Disaster Management", number: "108", icon: <Home size={18} /> },
  { name: "Women Helpline", number: "1091", icon: <Shield size={18} /> },
  { name: "Railway Enquiry", number: "139", icon: <Car size={18} /> },
  { name: "Cyber Crime", number: "1930", icon: <Wifi size={18} /> },
  { name: "Child Helpline", number: "1098", icon: <Flower2 size={18} /> },
  { name: "Senior Citizen", number: "14567", icon: <Heart size={18} /> },
  { name: "Aids Helpline", number: "1097", icon: <Heart size={18} /> },
  { name: "LPG Leak", number: "1906", icon: <AlertTriangle size={18} /> },
];

function Contact() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Phone /> Emergency Contacts
        </h1>
        <p>Save these numbers – they might save a life.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyNumbers.map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition p-4 flex items-center justify-between border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <div className="text-red-500 dark:text-red-400">{item.icon}</div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.number}</p>
              </div>
            </div>
            <a href={`tel:${item.number.split(" ")[0]}`} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">Call</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contact;