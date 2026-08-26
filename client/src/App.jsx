import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import API from './services/api.js';

// Safe Lucide Icon Loader
import * as LucideIcons from 'lucide-react';
const Search = LucideIcons.Search || (({ className }) => <span className={className}>🔍</span>);
const Activity = LucideIcons.Activity || (({ className }) => <span className={className}>📊</span>);
const AlertTriangle = LucideIcons.AlertTriangle || (({ className }) => <span className={className}>⚠️</span>);
const UserCheck = LucideIcons.UserCheck || (({ className }) => <span className={className}>✓</span>);
const LogOut = LucideIcons.LogOut || (({ className }) => <span className={className}>🚪</span>);
const Package = LucideIcons.Package || (({ className }) => <span className={className}>📦</span>);
const UserPlus = LucideIcons.UserPlus || (({ className }) => <span className={className}>👤➕</span>);
const X = LucideIcons.X || (({ className }) => <span className={className}>✕</span>);
const Pill = LucideIcons.Pill || (({ className }) => <span className={className}>💊</span>);
const Trash2 = LucideIcons.Trash2 || (({ className }) => <span className={className}>🗑️</span>);

export default function App() {
  const auth = useContext(AuthContext) || {};
  
  // Local token state
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

  // Persistent Registered Students Directory Storage
  const [registeredStudents, setRegisteredStudents] = useState(() => {
    const saved = localStorage.getItem('au_registered_students');
    return saved ? JSON.parse(saved) : [
      {
        id: '2026-10492',
        student_number: '2026-10492',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        strand_or_course: 'Grade 11 - ICT 1A',
        allergies: ['Penicillin'],
        existing_conditions: ['Asthma']
      }
    ];
  });

  // New Student Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    strand_or_course: 'Grade 11 - ICT 1A',
    allergies: '',
    existing_conditions: ''
  });

  // Inventory & Stock State
  const [medications, setMedications] = useState(() => {
    const saved = localStorage.getItem('au_inventory');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Paracetamol', dosage_form: 'Tablet', strength: '500mg', stock_quantity: 120, reorder_threshold: 30 },
      { id: '2', name: 'Amoxicillin', dosage_form: 'Capsule', strength: '250mg', stock_quantity: 12, reorder_threshold: 20 },
      { id: '3', name: 'Cetirizine', dosage_form: 'Tablet', strength: '10mg', stock_quantity: 45, reorder_threshold: 15 },
      { id: '4', name: 'Mefenamic Acid', dosage_form: 'Capsule', strength: '500mg', stock_quantity: 8, reorder_threshold: 15 }
    ];
  });

  // Intake Form Payload
  const [visitData, setVisitData] = useState({
    chief_complaint: '',
    temperature_celsius: '',
    blood_pressure: '',
    pulse_rate_bpm: '',
    respiratory_rate: '',
    treatment_given: '',
    selected_medication_id: '',
    medication_qty: 1,
    dosage_instructions: '',
    disposition: 'Rested in Clinic Bed'
  });

  // Persistent Recent Visits Queue state
  const [recentVisits, setRecentVisits] = useState(() => {
    const saved = localStorage.getItem('au_recent_visits');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        student_number: '2026-10492',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        strand_or_course: 'Grade 11 - ICT 1A',
        chief_complaint: 'Fever and Dizziness',
        temperature_celsius: '38.2',
        medication_given: 'Paracetamol 500mg (1 pc)',
        disposition: 'Returned to Class',
        status: 'Done',
        visit_timestamp: new Date().toISOString()
      }
    ];
  });

  const [alertBanner, setAlertBanner] = useState(null);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('au_registered_students', JSON.stringify(registeredStudents));
  }, [registeredStudents]);

  useEffect(() => {
    localStorage.setItem('au_recent_visits', JSON.stringify(recentVisits));
  }, [recentVisits]);

  useEffect(() => {
    localStorage.setItem('au_inventory', JSON.stringify(medications));
  }, [medications]);

  const fetchRecentVisits = async () => {
    try {
      const res = await API.get('/visits/recent');
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRecentVisits(res.data);
      }
    } catch (err) {
      console.warn('Backend API connection offline. Using local stored queue.');
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await API.get('/inventory');
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMedications(res.data);
      }
    } catch (err) {
      console.warn('Backend inventory API offline. Using local stored inventory.');
    }
  };

  useEffect(() => {
    if (localToken) {
      fetchRecentVisits();
      fetchInventory();
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

    const query = studentNum.trim().toLowerCase();

    const localMatch = registeredStudents.find(
      s => s.student_number.toLowerCase() === query || s.id.toString().toLowerCase() === query
    );

    if (localMatch) {
      setStudent(localMatch);
      return;
    }

    try {
      const res = await API.get(`/students/${studentNum}`);
      if (res && res.data) {
        setStudent(res.data);
      } else {
        throw new Error('NotFound');
      }
    } catch (err) {
      if (studentNum.trim().length > 0) {
        setLookupError('Student not found. Click "+ Register New Student" to add them to the database.');
        setNewStudentData(prev => ({ ...prev, student_number: studentNum }));
      } else {
        setLookupError('Please enter a valid Student ID Number.');
      }
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    const formattedStudent = {
      id: newStudentData.student_number || Date.now().toString(),
      student_number: newStudentData.student_number,
      first_name: newStudentData.first_name,
      last_name: newStudentData.last_name,
      strand_or_course: newStudentData.strand_or_course,
      allergies: newStudentData.allergies ? newStudentData.allergies.split(',').map(s => s.trim()) : [],
      existing_conditions: newStudentData.existing_conditions ? newStudentData.existing_conditions.split(',').map(s => s.trim()) : []
    };

    setRegisteredStudents(prev => [formattedStudent, ...prev.filter(s => s.student_number !== formattedStudent.student_number)]);
    setStudent(formattedStudent);

    try {
      await API.post('/students', formattedStudent);
    } catch (err) {
      console.warn('Offline mode: Saved student locally.');
    }

    setShowRegModal(false);
    setLookupError('');
    setNewStudentData({
      student_number: '',
      first_name: '',
      last_name: '',
      strand_or_course: 'Grade 11 - ICT 1A',
      allergies: '',
      existing_conditions: ''
    });
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    let medLabel = '';

    if (visitData.selected_medication_id) {
      const selectedMed = medications.find(m => m.id === visitData.selected_medication_id || m.medication_id === visitData.selected_medication_id);
      if (selectedMed) {
        const reqQty = parseInt(visitData.medication_qty || 1);
        if (selectedMed.stock_quantity < reqQty) {
          alert(`Insufficient stock for ${selectedMed.name}! Current stock: ${selectedMed.stock_quantity}`);
          return;
        }

        medLabel = `${selectedMed.name} ${selectedMed.strength} (${reqQty} pc${reqQty > 1 ? 's' : ''})`;

        setMedications(prevMeds =>
          prevMeds.map(med => {
            const medId = med.id || med.medication_id;
            return medId === visitData.selected_medication_id
              ? { ...med, stock_quantity: med.stock_quantity - reqQty }
              : med;
          })
        );
      }
    }

    const isDone = visitData.disposition === 'Returned to Class' || visitData.disposition === 'Sent Home / Fetched by Parent';

    const newVisitRecord = {
      id: Date.now(),
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      strand_or_course: student.strand_or_course,
      chief_complaint: visitData.chief_complaint,
      temperature_celsius: visitData.temperature_celsius || '36.5',
      medication_given: medLabel,
      disposition: visitData.disposition,
      status: isDone ? 'Done' : 'Ongoing',
      visit_timestamp: new Date().toISOString()
    };

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
      if (parseFloat(visitData.temperature_celsius) >= 38.5) {
        setAlertBanner(`High fever alert detected for ${student.first_name} ${student.last_name} (${visitData.temperature_celsius}°C).`);
      } else {
        setAlertBanner(null);
      }
    }

    setRecentVisits((prev) => [newVisitRecord, ...prev]);

    setVisitData({
      chief_complaint: '',
      temperature_celsius: '',
      blood_pressure: '',
      pulse_rate_bpm: '',
      respiratory_rate: '',
      treatment_given: '',
      selected_medication_id: '',
      medication_qty: 1,
      dosage_instructions: '',
      disposition: 'Rested in Clinic Bed'
    });
    setStudent(null);
    setStudentNum('');
  };

  // Toggle Visit Status Function
  const toggleVisitStatus = (visitId) => {
    setRecentVisits(prev =>
      prev.map(v => {
        if (v.id === visitId) {
          const nextStatus = v.status === 'Ongoing' ? 'Done' : 'Ongoing';
          return {
            ...v,
            status: nextStatus,
            disposition: nextStatus === 'Done' ? 'Returned to Class' : 'Rested in Clinic Bed'
          };
        }
        return v;
      })
    );
  };

  // 🗑️ Delete Single Visit Item Function
  const handleDeleteVisit = async (visitId) => {
    if (window.confirm('Are you sure you want to delete this visit record?')) {
      setRecentVisits(prev => prev.filter(v => v.id !== visitId));
      
      try {
        await API.delete(`/visits/${visitId}`);
      } catch (err) {
        console.warn('Backend API offline. Removed locally.');
      }
    }
  };

  const selectStudentFromRecord = (studentNo) => {
    const match = registeredStudents.find(s => s.student_number === studentNo);
    if (match) {
      setStudent(match);
      setStudentNum(match.student_number);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 space-y-4 relative">
            <button 
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-2">
              <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5" /> Register New Student Patient
              </h3>
              <p className="text-xs text-gray-500">Input student details to permanently store in clinic records.</p>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Student Number</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., 2026-10492"
                  className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                  value={newStudentData.student_number}
                  onChange={(e) => setNewStudentData({...newStudentData, student_number: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">First Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Juan"
                    className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                    value={newStudentData.first_name}
                    onChange={(e) => setNewStudentData({...newStudentData, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Dela Cruz"
                    className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                    value={newStudentData.last_name}
                    onChange={(e) => setNewStudentData({...newStudentData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Strand / Grade / Course</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Grade 11 - ICT 1A"
                  className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                  value={newStudentData.strand_or_course}
                  onChange={(e) => setNewStudentData({...newStudentData, strand_or_course: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Known Allergies (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Penicillin, Peanuts (leave blank if none)"
                  className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                  value={newStudentData.allergies}
                  onChange={(e) => setNewStudentData({...newStudentData, allergies: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Existing Conditions (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Asthma, Hypertension (leave blank if none)"
                  className="w-full mt-1 p-2 border rounded text-xs outline-none focus:border-blue-600"
                  value={newStudentData.existing_conditions}
                  onChange={(e) => setNewStudentData({...newStudentData, existing_conditions: e.target.value})}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs rounded font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-800 text-white text-xs rounded font-semibold hover:bg-blue-900"
                >
                  Save & Select Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
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

          {/* Student Search */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                <Search className="w-4 h-4 text-blue-700" /> Patient Lookup
              </h2>
              <button 
                onClick={() => setShowRegModal(true)}
                className="text-xs bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded font-semibold hover:bg-blue-100 flex items-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" /> + Register New Student
              </button>
            </div>

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
            {lookupError && <p className="text-xs text-red-500 mt-2 font-medium">{lookupError}</p>}

            {/* Registered Student Pills */}
            {registeredStudents.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Saved / Registered Students (Click to Select):</p>
                <div className="flex flex-wrap gap-1.5">
                  {registeredStudents.map((reg) => (
                    <button
                      key={reg.student_number}
                      onClick={() => selectStudentFromRecord(reg.student_number)}
                      className="text-xs bg-gray-100 hover:bg-blue-50 border border-gray-300 hover:border-blue-400 text-gray-800 px-2.5 py-1 rounded-md transition text-left flex items-center gap-1"
                    >
                      <span className="font-semibold">{reg.first_name} {reg.last_name}</span>
                      <span className="text-[10px] text-gray-500">({reg.student_number})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Patient Intake Form */}
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

              <div className="flex flex-wrap gap-2 text-xs">
                {student.allergies?.length > 0 ? (
                  student.allergies.map((allergy, idx) => (
                    <span key={idx} className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-medium">
                      Allergy: {allergy}
                    </span>
                  ))
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[11px]">No known allergies</span>
                )}

                {student.existing_conditions?.length > 0 ? (
                  student.existing_conditions.map((cond, idx) => (
                    <span key={idx} className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full font-medium">
                      Condition: {cond}
                    </span>
                  ))
                ) : (
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[11px]">No existing conditions</span>
                )}
              </div>

              <form onSubmit={handleVisitSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase">Chief Complaint / Sickness</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Fever, Headache, Stomachache" 
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

                <div className="border-t pt-3 bg-blue-50/70 p-3 rounded-lg">
                  <h4 className="text-xs font-bold text-blue-900 uppercase mb-2 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" /> Medication Prescribed & Dispensed
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-gray-600">Select Medicine</label>
                      <select 
                        className="w-full mt-1 border p-2 rounded text-xs bg-white"
                        value={visitData.selected_medication_id}
                        onChange={(e) => setVisitData({...visitData, selected_medication_id: e.target.value})}
                      >
                        <option value="">-- No Medication Dispensed --</option>
                        {medications.map(med => {
                          const id = med.id || med.medication_id;
                          return (
                            <option key={id} value={id}>
                              {med.name} {med.strength} ({med.stock_quantity} in stock)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600">Dispense Qty</label>
                      <input 
                        type="number" min="1" className="w-full mt-1 border p-2 rounded text-xs bg-white"
                        value={visitData.medication_qty}
                        onChange={(e) => setVisitData({...visitData, medication_qty: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Treatment / Instructions</label>
                    <textarea 
                      rows="2" 
                      placeholder="e.g. Given 1 tablet after food, Rested 30 mins"
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
                      <option>Rested in Clinic Bed</option>
                      <option>Returned to Class</option>
                      <option>Sent Home / Fetched by Parent</option>
                      <option>Referred to Hospital</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-800 text-white font-bold py-2 rounded text-sm hover:bg-blue-900 transition">
                  Save Visit Entry & Complete Dispensing
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Right Column: Inventory + Clinic Visits timeline */}
        <section className="space-y-6">
          
          {/* Inventory Widget */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <Package className="w-4 h-4 text-blue-700" /> Stock Inventory Level
            </h2>
            <div className="space-y-2">
              {medications.map((med) => {
                const id = med.id || med.medication_id;
                const isLow = med.stock_quantity <= med.reorder_threshold;
                return (
                  <div key={id} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded border">
                    <div>
                      <p className="font-bold text-gray-800">{med.name} <span className="font-normal text-gray-500">({med.strength})</span></p>
                      <p className="text-[10px] text-gray-400">{med.dosage_form}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                        {med.stock_quantity} pcs {isLow ? '(LOW)' : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinic Visits & Status Timeline with Trash Button */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                <Activity className="w-4 h-4 text-blue-700" /> Clinic Visits & Status
              </h2>
              <span className="text-[11px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
                {recentVisits.filter(v => v.status === 'Ongoing').length} Ongoing
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {recentVisits.length === 0 ? (
                <p className="text-xs text-gray-400">No recent visits recorded.</p>
              ) : (
                recentVisits.map((v) => {
                  const isOngoing = v.status === 'Ongoing';
                  return (
                    <div 
                      key={v.id || Math.random()} 
                      className={`p-3.5 bg-white border rounded-md shadow-xs transition ${isOngoing ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <button 
                            onClick={() => selectStudentFromRecord(v.student_number)}
                            className="font-bold text-sm text-gray-900 hover:text-blue-800 text-left transition"
                          >
                            {v.first_name} {v.last_name}
                          </button>
                          <p className="text-[10px] text-gray-400">{v.strand_or_course || 'Grade 11 - ICT 1A'}</p>
                        </div>

                        {/* Status Toggle & Delete Button Group */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleVisitStatus(v.id)}
                            title="Click to toggle status (Ongoing <-> Done)"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition ${
                              isOngoing
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                                : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                            }`}
                          >
                            {isOngoing ? '⏳ Ongoing' : '✓ Done'}
                          </button>

                          {/* 🗑️ Trash / Delete Item Button */}
                          <button
                            onClick={() => handleDeleteVisit(v.id)}
                            title="Delete this visit entry"
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-700 mt-1 font-medium">{v.chief_complaint}</p>

                      {v.medication_given && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded w-fit">
                          <Pill className="w-3 h-3 text-blue-600" /> {v.medication_given}
                        </div>
                      )}

                      <div className="mt-2.5 flex justify-between items-center text-xs border-t pt-2">
                        <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${parseFloat(v.temperature_celsius) >= 38.5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {v.temperature_celsius ? `${v.temperature_celsius}°C` : '36.5°C'}
                        </span>
                        <span className="text-blue-900 font-bold text-[11px]">{v.disposition}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}