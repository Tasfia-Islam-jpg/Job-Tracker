import React from 'react';

const Dashboard = ({
  totalApps,
  countByStatus,
  editingId,
  jobData,
  handleJobChange,
  handleFileChange,
  handleJobSubmit,
  setEditingId,
  setJobData,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filteredJobs,
  openPDF,
  startEdit,
  deleteCard
}) => {
  return (
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
  );
};

export default Dashboard;