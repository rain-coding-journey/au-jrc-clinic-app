import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import API from './services/api';
import { Search, Activity, AlertTriangle, UserCheck, LogOut } from 'lucide-react';

export default function App() {
  const auth = useContext(AuthContext) || {};
  const { token = null, user = null, login = () => {}, logout = () => {} } = auth;

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Lookup & Intake State
  const [studentNum, setStudentNum] = useState('');
  const [student, setStudent] = useState(null);
  const [lookupError, setLookupError] = useState('');
  
  // Intake Form Payload
  const [visitData, setVisitData] = useState({
    chief_complaint: '',
    temperature_celsius: '',
    blood_pressure: '',
    pulse_rate_bpm: '',
    respiratory_rate: '',
    treatment_given: '',
    medication_administered: '',
    disposition: 'Returned to Class'
  });

  const [recentVisits, setRecentVisits] = useState([]);
  const [alertBanner, setAlertBanner] = useState(null);

  const fetchRecentVisits = async () => {
    try {
      const res = await API.get('/visits/recent');
      if (res && res.data && Array.isArray(res.data)) {
        setRecentVisits(res.data);
      } else {
        setRecentVisits([]);
      }
    } catch (err) {
      console.warn('API connection offline or endpoint unreachable:', err);
      setRecentVisits([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecentVisits();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login(email, password);
      if (res && !res.success) {
        setLoginError(res.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setLoginError('Unable to connect to authentication server.');
    }
  };

  const handleStudentLookup = async (e) => {
    e.preventDefault();
    setLookupError('');
    setStudent(null);
    try {
      const res = await API.get(`/students/${studentNum}`);
      if (res && res.data) {
        setStudent(res.data);
      } else {
        setLookupError('Student record not found.');
      }
    } catch (err) {
      setLookupError('Student not found. Please verify the ID or server status.');
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    try {
      const res = await API.post('/visits', {
        student_id: student.id,
        ...visitData
      });

      if (res && res.data && res.data.alert_triggered) {
        setAlertBanner(res.data.alert_message);
      } else {
        setAlertBanner(null);
      }

      // Reset Form
      setVisitData({
        chief_complaint: '',
        temperature_celsius: '',
        blood_pressure: '',
        pulse_rate_bpm: '',
        respiratory_rate: '',
        treatment_given: '',
        medication_administered: '',
        disposition: 'Returned to Class'
      });
      setStudent(null);
      setStudentNum('');
      fetchRecentVisits();
    } catch (err) {
      alert('Error submitting visit log. Check network/server connection.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-blue-900">Arellano University</h1>
            <p className="text-sm text-gray-600">Jose Rizal Campus Clinic Portal</p>
          </div>
          {loginError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Email Address</label>
              <input 
                type="email" 
                required 
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Password</label>
              <input 
                type="password" 
                required 
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded font-semibold hover:bg-blue-900 transition">
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-bold text-lg">AU JRC Clinic System</h1>
          <p className="text-xs text-blue-200">Campus Student Record & Vitals Management</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-blue-800 px-3 py-1 rounded-full">{user?.full_name || 'Staff User'} ({user?.role || 'Staff'})</span>
          <button onClick={logout} className="p-1 hover:bg-blue-800 rounded">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Intake & Vitals Form */}
        <section className="lg:col-span-2 space-y-6">
          
          {alertBanner && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded shadow-sm">
              <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800">Critical Medical Alert</h4>
                <p className="text-sm text-red-700">{alertBanner}</p>
              </div>
            </div>
          )}

          {/* Student Search Widget */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-700" /> Patient Lookup
            </h2>
            <form onSubmit={handleStudentLookup} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter AU Student No. (e.g., 2026-10492)" 
                className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-600"
                value={studentNum}
                onChange={(e) => setStudentNum(e.target.value)}
              />
              <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-900">
                Search
              </button>
            </form>
            {lookupError && <p className="text-xs text-red-500 mt-2">{lookupError}</p>}
          </div>

          {/* Intake Entry Form */}
          {student && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-blue-950">{student.first_name} {student.last_name}</h3>
                  <p className="text-xs text-gray-500">ID: {student.student_number} | Strand/Course: {student.strand_or_course}</p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-semibold flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Active Record
                </span>
              </div>

              {/* Medical Flag Tags */}
              <div className="flex gap-2 text-xs">
                {student.allergies?.map((allergy, idx) => (
                  <span key={idx} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    Allergy: {allergy}
                  </span>
                ))}
                {student.existing_conditions?.map((cond, idx) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                    Condition: {cond}
                  </span>
                ))}
              </div>

              <form onSubmit={handleVisitSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Chief Complaint</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Headache, High Fever, Wound Dressing" 
                    className="w-full mt-1 border p-2 rounded text-sm"
                    value={visitData.chief_complaint}
                    onChange={(e) => setVisitData({...visitData, chief_complaint: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Temp (°C)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="36.5" 
                      className="w-full mt-1 border p-2 rounded text-sm"
                      value={visitData.temperature_celsius}
                      onChange={(e) => setVisitData({...visitData, temperature_celsius: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Blood Pressure</label>
                    <input 
                      type="text" 
                      placeholder="120/80" 
                      className="w-full mt-1 border p-2 rounded text-sm"
                      value={visitData.blood_pressure}
                      onChange={(e) => setVisitData({...visitData, blood_pressure: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Pulse (BPM)</label>
                    <input 
                      type="number" 
                      placeholder="80" 
                      className="w-full mt-1 border p-2 rounded text-sm"
                      value={visitData.pulse_rate_bpm}
                      onChange={(e) => setVisitData({...visitData, pulse_rate_bpm: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Resp Rate</label>
                    <input 
                      type="number" 
                      placeholder="18" 
                      className="w-full mt-1 border p-2 rounded text-sm"
                      value={visitData.respiratory_rate}
                      onChange={(e) => setVisitData({...visitData, respiratory_rate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Treatment Provided</label>
                    <textarea 
                      rows="2" 
                      className="w-full mt-1 border p-2 rounded text-sm"
                      value={visitData.treatment_given}
                      onChange={(e) => setVisitData({...visitData, treatment_given: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Disposition Status</label>
                    <select 
                      className="w-full mt-1 border p-2 rounded text-sm bg-white"
                      value={visitData.disposition}
                      onChange={(e) => setVisitData({...visitData, disposition: e.target.value})}
                    >
                      <option>Returned to Class</option>
                      <option>Rested in Clinic Bed</option>
                      <option>Sent Home / Fetched by Parent</option>
                      <option>Referred to Hospital</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-800 text-white font-bold py-2 rounded text-sm hover:bg-blue-900">
                  Save Visit Entry
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Right 1 Column: Activity Feed */}
        <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-700" /> Recent Clinic Visits
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {recentVisits.length === 0 ? (
              <p className="text-xs text-gray-400">No recent visits recorded today.</p>
            ) : (
              recentVisits.map((v) => (
                <div key={v.id || Math.random()} className="p-3 border-b last:border-0 hover:bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-gray-800">{v.first_name} {v.last_name}</span>
                    <span className="text-[10px] text-gray-400">
                      {v.visit_timestamp ? new Date(v.visit_timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{v.chief_complaint}</p>
                  <div className="mt-2 flex justify-between items-center text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-medium ${parseFloat(v.temperature_celsius) >= 38.5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {v.temperature_celsius ? `${v.temperature_celsius}°C` : 'N/A'}
                    </span>
                    <span className="text-blue-900 font-medium">{v.disposition}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}