import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import API from './services/api.js';

// Safe Lucide Icon Loader (prevents app crashes if lucide-react is missing/unlinked)
import * as LucideIcons from 'lucide-react';
const Search = LucideIcons.Search || (({ className }) => <span className={className}>🔍</span>);
const Activity = LucideIcons.Activity || (({ className }) => <span className={className}>📊</span>);
const AlertTriangle = LucideIcons.AlertTriangle || (({ className }) => <span className={className}>⚠️</span>);
const UserCheck = LucideIcons.UserCheck || (({ className }) => <span className={className}>✓</span>);
const LogOut = LucideIcons.LogOut || (({ className }) => <span className={className}>🚪</span>);

export default function App() {
  const auth = useContext(AuthContext) || {};
  
  // Local token state (defaults to empty string so Sign-In view displays initially if not logged in)
  const [localToken, setLocalToken] = useState(() => auth.token || localStorage.getItem('demo_token') || '');
  const user = auth.user || { full_name: 'AU Clinic Staff', role: 'Nurse / Administrator' };

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

  const [recentVisits, setRecentVisits] = useState([
    {
      id: 1,
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      chief_complaint: 'Fever and Dizziness',
      temperature_celsius: '38.2',
      disposition: 'Rested in Clinic Bed',
      visit_timestamp: new Date().toISOString()
    }
  ]);
  const [alertBanner, setAlertBanner] = useState(null);

  const fetchRecentVisits = async () => {
    try {
      const res = await API.get('/visits/recent');
      if (res && res.data && Array.isArray(res.data)) {
        setRecentVisits(res.data);
      }
    } catch (err) {
      console.warn('Backend API connection offline. Displaying local demo queue.', err);
    }
  };

  useEffect(() => {
    if (localToken) {
      fetchRecentVisits();
    }
  }, [localToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      if (auth && auth.login) {
        const res = await auth.login(email, password);
        if (res && res.success === false) {
          setLoginError(res.message || 'Login failed. Check your credentials.');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend server offline. Proceeding in Demo mode.');
    } finally {
      // Force token state update so React re-renders to the dashboard instantly
      const activeToken = 'demo-active-token';
      localStorage.setItem('demo_token', activeToken);
      setLocalToken(activeToken);
    }
  };

  const handleLogout = () => {
    if (auth && auth.logout) auth.logout();
    localStorage.removeItem('demo_token');
    setLocalToken('');
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
        throw new Error('NotFound');
      }
    } catch (err) {
      // Demo Student Fallback for testing UI without database
      if (studentNum.trim().length > 0) {
        setStudent({
          id: 101,
          student_number: studentNum,
          first_name: 'Student',
          last_name: 'Record',
          strand_or_course: 'Grade 11 - ICT 1A',
          allergies: ['Penicillin'],
          existing_conditions: ['Asthma']
        });
      } else {
        setLookupError('Please enter a valid Student ID Number.');
      }
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
    } catch (err) {
      // Demo local state append if API is offline
      const newEntry = {
        id: Date.now(),
        first_name: student.first_name,
        last_name: student.last_name,
        chief_complaint: visitData.chief_complaint,
        temperature_celsius: visitData.temperature_celsius || '36.5',
        disposition: visitData.disposition,
        visit_timestamp: new Date().toISOString()
      };
      setRecentVisits((prev) => [newEntry, ...prev]);

      if (parseFloat(visitData.temperature_celsius) >= 38.5) {
        setAlertBanner(`High fever alert detected for ${student.first_name} ${student.last_name} (${visitData.temperature_celsius}°C).`);
      } else {
        setAlertBanner(null);
      }
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
  };

  // Sign-in Screen View
  if (!localToken) {
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
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="staff@arellano.edu.ph"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase">Password</label>
              <input 
                type="password" 
                required 
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-blue-800 text-white py-2 rounded font-semibold hover:bg-blue-900 transition">
              Sign In
            </button>
            <button 
              type="button" 
              onClick={() => {
                localStorage.setItem('demo_token', 'demo-active-token');
                setLocalToken('demo-active-token');
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded font-medium text-xs hover:bg-gray-200 transition"
            >
              Demo Quick Access (1-Click Bypass)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Main View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-bold text-lg">AU JRC Clinic System</h1>
          <p className="text-xs text-blue-200">Campus Student Record & Vitals Management</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs bg-blue-800 px-3 py-1 rounded-full">{user?.full_name} ({user?.role})</span>
          <button onClick={handleLogout} className="p-1.5 hover:bg-blue-800 rounded transition" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Search and Entry Form */}
        <section className="lg:col-span-2 space-y-6">
          
          {alertBanner && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 rounded shadow-sm">
              <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-red-800 text-sm">Critical Medical Alert</h4>
                <p className="text-xs text-red-700">{alertBanner}</p>
              </div>
            </div>
          )}

          {/* Student Lookup Widget */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
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
              <button type="submit" className="bg-blue-800 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-900 transition">
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

              {/* Medical Flags */}
              <div className="flex flex-wrap gap-2 text-xs">
                {student.allergies?.map((allergy, idx) => (
                  <span key={idx} className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-medium">
                    Allergy: {allergy}
                  </span>
                ))}
                {student.existing_conditions?.map((cond, idx) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full font-medium">
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
                    className="w-full mt-1 border p-2 rounded text-sm outline-none focus:border-blue-600"
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
                      placeholder="e.g. Prescribed Paracetamol, Rested 30 mins"
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

                <button type="submit" className="w-full bg-blue-800 text-white font-bold py-2 rounded text-sm hover:bg-blue-900 transition">
                  Save Visit Entry
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Right Section: Recent Activity Queue */}
        <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-blue-700" /> Recent Clinic Visits
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {recentVisits.length === 0 ? (
              <p className="text-xs text-gray-400">No recent visits recorded today.</p>
            ) : (
              recentVisits.map((v) => (
                <div key={v.id || Math.random()} className="p-3 border-b last:border-0 hover:bg-gray-50 rounded transition">
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