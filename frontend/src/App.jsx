import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    // 🛑 STRICT FILE SIZE SAFETY VALVE (Limits to 1.5MB to ensure instant MongoDB response)
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

      // Reset state completely upon confirmed database response
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
      <nav style={{ background: '#2c3e50', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => !isLoggedIn && setView('login')}>
          💼 <span style={{ background: 'linear-gradient(45deg, #2ecc71, #3498db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JobTracker Pro</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <span style={{ color: '#ecf0f1', fontSize: '14px' }}>📡 Workspace Sync Active</span>
              <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
            </>
          ) : (
            <>
              <span onClick={() => setView('login')} style={{ color: '#ecf0f1', cursor: 'pointer', fontSize: '15px', fontWeight: view === 'login' ? 'bold' : 'normal' }}>Sign In</span>
              <span onClick={() => setView('register')} style={{ color: '#ecf0f1', cursor: 'pointer', fontSize: '15px', fontWeight: view === 'register' ? 'bold' : 'normal', background: '#3498db', padding: '6px 12px', borderRadius: '4px' }}>Get Started</span>
            </>
          )}
        </div>
      </nav>

      {!isLoggedIn && (
        <div style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', color: '#fff', padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '38px', margin: '0 0 15px 0', fontWeight: '800' }}>Master Your Career Search Pipeline</h1>
          <p style={{ fontSize: '16px', color: '#bdc3c7', maxWidth: '600px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
            Organize tech job applications, track interview stages, log server-synced notes, and manage interview PDFs in one private workspace dashboard.
          </p>
        </div>
      )}

      <div style={{ maxWidth: '950px', margin: '0 auto', padding: '40px 20px' }}>
        {isLoggedIn && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' }}>
              <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center', border: '1px solid #eee' }}><h3>{totalApps}</h3><small>Total Apps</small></div>
              <div style={{ background: '#dfebf6', padding: '15px', borderRadius: '8px', textAlign: 'center' }}><h3>{countByStatus('Applied')}</h3><small>Applied</small></div>
              <div style={{ background: '#fef3d6', padding: '15px', borderRadius: '8px', textAlign: 'center' }}><h3>{countByStatus('Interviewing')}</h3><small>Interviews</small></div>
              <div style={{ background: '#dbf7e9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}><h3>{countByStatus('Offered')}</h3><small>Offered</small></div>
              <div style={{ background: '#fce8e6', padding: '15px', borderRadius: '8px', textAlign: 'center' }}><h3>{countByStatus('Declined')}</h3><small>Declined</small></div>
            </div>

            <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', border: '1px solid #e0e0e0', marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0 }}>{editingId ? '⚠️ Edit Tracking Entry' : '➕ Record New Application Entry'}</h3>
              <form onSubmit={handleJobSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <input type="text" name="company" value={jobData.company} onChange={handleJobChange} required placeholder="Company" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="text" name="position" value={jobData.position} onChange={handleJobChange} required placeholder="Position" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <select name="status" value={jobData.status} onChange={handleJobChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Declined">Declined</option>
                </select>
                <input type="text" name="location" value={jobData.location} onChange={handleJobChange} placeholder="Location" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input type="date" name="interviewDate" value={jobData.interviewDate} onChange={handleJobChange} style={{ padding: '9px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <input id="pdf-upload" type="file" accept=".pdf" onChange={handleFileChange} style={{ padding: '6px 0', fontSize: '13px' }} />
                <input type="url" name="link" value={jobData.link} onChange={handleJobChange} placeholder="Job Posting URL" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', gridColumn: 'span 3' }} />
                <textarea name="notes" value={jobData.notes} onChange={handleJobChange} placeholder="Notes..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', gridColumn: 'span 3', minHeight: '60px' }} />
                
                <div style={{ gridColumn: 'span 3', display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{editingId ? 'Save Changes' : 'Publish Application Card'}</button>
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setJobData({ company: '', position: '', status: 'Applied', location: 'Remote', link: '', notes: '', interviewDate: '', pdfData: '' }); }} style={{ padding: '12px', background: '#95a5a6', color: '#fff', border: 'none', borderRadius: '6px' }}>Cancel</button>}
                </div>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <input type="text" placeholder="🔍 Search by company or position..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 2, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff' }}>
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {filteredJobs.map((job) => (
                <div key={job._id} style={{ padding: '20px', borderRadius: '10px', border: '1px solid #eee', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ float: 'right', fontSize: '12px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: job.status === 'Applied' ? '#dfebf6' : job.status === 'Interviewing' ? '#fef3d6' : job.status === 'Offered' ? '#dbf7e9' : '#fce8e6', color: job.status === 'Applied' ? '#2b5a84' : job.status === 'Interviewing' ? '#a07415' : job.status === 'Offered' ? '#186a3b' : '#c5221f' }}>{job.status}</span>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{job.position}</h4>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#555' }}>🏢 {job.company} <span style={{ color: '#95a5a6', fontWeight: 'normal', fontSize: '13px' }}>({job.location || 'Remote'})</span></p>
                    {job.interviewDate && <div style={{ margin: '5px 0 10px 0', fontSize: '13px', color: '#e67e22', fontWeight: 'bold' }}>📅 Interview: {job.interviewDate}</div>}
                    {job.pdfData && <button onClick={() => openPDF(job.pdfData)} style={{ background: 'none', border: 'none', color: '#e74c3c', textDecoration: 'underline', padding: 0, fontSize: '13px', cursor: 'pointer', display: 'block', marginBottom: '10px', fontWeight: '500' }}>📄 View Attached PDF</button>}
                    {job.link && <a href={job.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', fontSize: '13px', color: '#3498db', marginBottom: '10px', textDecoration: 'none' }}>🔗 View Posting</a>}
                    {job.notes && <p style={{ margin: '10px 0 0 0', padding: '10px', background: '#fdfefe', borderLeft: '3px solid #bdc3c7', fontSize: '13px', color: '#555', fontStyle: 'italic' }}>📝 {job.notes}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                    <button onClick={() => startEdit(job)} style={{ padding: '6px 12px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                    <button onClick={() => deleteCard(job._id)} style={{ padding: '6px 12px', background: '#c5221f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoggedIn && (
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