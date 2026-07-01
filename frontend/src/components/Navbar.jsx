import React from 'react';

const Navbar = ({ isLoggedIn, view, setView, handleLogout }) => {
  return (
    <nav style={{ background: '#2c3e50', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div 
        style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} 
        onClick={() => !isLoggedIn && setView('login')}
      >
        💼 <span style={{ background: 'linear-gradient(45deg, #2ecc71, #3498db)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>JobTracker Pro</span>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {isLoggedIn ? (
          <>
            <span style={{ color: '#ecf0f1', fontSize: '14px' }}>📡 Workspace Sync Active</span>
            <button 
              onClick={handleLogout} 
              style={{ padding: '8px 16px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <span 
              onClick={() => setView('login')} 
              style={{ color: '#ecf0f1', cursor: 'pointer', fontSize: '15px', fontWeight: view === 'login' ? 'bold' : 'normal' }}
            >
              Sign In
            </span>
            <span 
              onClick={() => setView('register')} 
              style={{ color: '#ecf0f1', cursor: 'pointer', fontSize: '15px', fontWeight: view === 'register' ? 'bold' : 'normal', background: '#3498db', padding: '6px 12px', borderRadius: '4px' }}
            >
              Get Started
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;