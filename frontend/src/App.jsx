import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState('login'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const [jobs, setJobs] = useState([]);
  const [jobData, setJobData] = useState({ company: '', position: '', status: 'Applied', location: 'Remote', link: '', notes: '', interviewDate: '', pdfData: '' });
  const [editingId, setEditingId] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setView('dashboard');
      fetchUserJobs(token);
    }
  }, []);

  const handleAuthChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleJobChange = (e) => setJobData({ ...jobData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload PDF documents only.");
      e.target.value = null;
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      alert("This PDF file is too large for the free cloud tier database. Please select a compressed file under 1.5MB!");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setJobData({ ...jobData, pdfData: reader.result });
    };
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const endpoint = view === 'login' ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    try {
      const response = await axios.post(endpoint, formData);
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      setView('dashboard');
      fetchUserJobs(response.data.token);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) { 
      const msg = error.response?.data?.msg || 'Authentication failed. Server unreachable.';
      setErrorMessage(msg);
      alert(`🔒 AUTH ERROR: ${msg}`);
    }
  };

  const fetchUserJobs = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs', { headers: { 'x-auth-token': token } });
      setJobs(response.data);
    } catch (error) { 
      console.error(error);
      alert(`📥 FETCH ERROR: Could not sync with server. Status: ${error.response?.status}`);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (editingId) {
        const response = await axios.put(`http://localhost:5000/api/jobs/${editingId}`, jobData, { headers: { 'x-auth-token': token } });
        setJobs(jobs.map(job => job._id === editingId ? response.data : job));
        setEditingId(null);
      } else {
        const response = await axios.post('http://localhost:5000/api/jobs', jobData, { headers: { 'x-auth-token': token } });
        setJobs([response.data, ...jobs]);
      }

      setJobData({ company: '', position: '', status: 'Applied', location: 'Remote', link: '', notes: '', interviewDate: '', pdfData: '' });
      const fileInput = document.getElementById('pdf-upload');
      if (fileInput) fileInput.value = '';

    } catch (error) { 
      console.error("Database tracking sync failed:", error);
      alert(`📤 SAVE ERROR: ${error.response?.data?.msg || "Cloud server rejected request."}`);
    }
  };

  const startEdit = (job) => {
    setEditingId(job._id);
    setJobData({ 
      company: job.company, 
      position: job.position, 
      status: job.status, 
      location: job.location || 'Remote', 
      link: job.link || '', 
      notes: job.notes || '',
      interviewDate: job.interviewDate || '',
      pdfData: job.pdfData || ''
    });
  };

  const deleteCard = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this application card permanently from MongoDB Atlas?")) return;
    
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, { headers: { 'x-auth-token': token } });
      setJobs(jobs.filter(job => job._id !== id)); 
    } catch (error) { 
      console.error(error);
      alert(`❌ DELETE ERROR: Failed to clear data from cloud server.`); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setJobs([]);
    setView('login');
  };

  const totalApps = jobs.length;
  const countByStatus = (status) => jobs.filter(j => j.status === status).length;

  const filteredJobs = jobs.filter(job => {
    if (!job.company || !job.position) return false;
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || job.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openPDF = (base64String) => {
    const pdfWindow = window.open("");
    pdfWindow.document.write(`<iframe width='100%' height='100%' src='${base64String}'></iframe>`);
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#fcfcfc', margin: 0 }}>
      {/* 🚀 Render Modular Navigation Component */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        view={view} 
        setView={setView} 
        handleLogout={handleLogout} 
      />

      {!isLoggedIn && (
        <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '38px', margin: '0 0 15px 0', fontWeight: '800' }}>Master Your Career Search Pipeline</h1>
          <p style={{ fontSize: '16px', color: '#bdc3c7', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
            Organize tech job applications, track interview stages, log server-synced notes, and manage interview PDFs in one private workspace dashboard.
          </p>
        </div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', padding: '40px 20px' }}>
        {isLoggedIn ? (
          /* 🚀 Render Modular Dashboard Component */
          <Dashboard
            totalApps={totalApps}
            countByStatus={countByStatus}
            editingId={editingId}
            jobData={jobData}
            handleJobChange={handleJobChange}
            handleFileChange={handleFileChange}
            handleJobSubmit={handleJobSubmit}
            setEditingId={setEditingId}
            setJobData={setJobData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            filteredJobs={filteredJobs}
            openPDF={openPDF}
            startEdit={startEdit}
            deleteCard={deleteCard}
          />
        ) : (
          /* 🔒 Auth Interface Stays Anchored inside App Layout Container */
          <div style={{ maxWidth: '420px', margin: '40px auto 0 auto' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #eee' }}>
              <h3 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#2c3e50' }}>{view === 'login' ? 'Sign In to Your Workspace' : 'Create Your Free Account'}</h3>
              {errorMessage && <div style={{ background: '#fce8e6', color: '#c5221f', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{errorMessage}</div>}
              <form onSubmit={handleAuthSubmit}>
                {view === 'register' && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleAuthChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
                  </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleAuthChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleAuthChange} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>{view === 'login' ? 'Sign In' : 'Sign Up'}</button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
                {view === 'login' ? "New to JobTracker? " : "Already have an account? "}
                <span onClick={() => { setView(view === 'login' ? 'register' : 'login'); setErrorMessage(''); }} style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>{view === 'login' ? 'Register here' : 'Login here'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;