import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <span className="logo-icon">🏥</span>
            <span>VirtualDoc Admin</span>
          </div>
          <div className="nav-user">
            <span>Welcome, {user.firstName || user.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your healthcare platform</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Users</h3>
            <p>Manage platform users</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">🏢</div>
            <h3>Tenants</h3>
            <p>Manage hospitals & clinics</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Analytics</h3>
            <p>View platform statistics</p>
          </div>
          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Configure system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

