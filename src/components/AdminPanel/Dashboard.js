import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from './Alert';
import '../Alert.css';

const Dashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/dashboard/alerts', config);
      setAlerts(res.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Fallback to mock data if API fails
      const mockAlerts = [
        { _id: '1', message: 'System maintenance scheduled for tonight', type: 'warning' },
        { _id: '2', message: 'New feature update available', type: 'info' }
      ];
      setAlerts(mockAlerts);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/dashboard/stats', config);
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert._id !== alertId));
  };

  return (
    <div className="menu-content">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="alert-icon" onClick={() => setShowAlerts(!showAlerts)}>
          🔔
          {alerts.length > 0 && <span className="alert-count">{alerts.length}</span>}
        </div>
      </div>
      <p>Welcome to the Admin Dashboard. Here is a quick overview of the school management system.</p>

      {showAlerts && (
        <div className="alerts-panel">
          {alerts.length === 0 ? (
            <p>No new alerts.</p>
          ) : (
            alerts.map(alert => (
              <Alert
                key={alert._id}
                message={alert.message}
                type={alert.type}
                onClose={() => dismissAlert(alert._id)}
                duration={5000}
              />
            ))
          )}
        </div>
      )}

      <div className="stats-grid">
        {loading ? (
          <p>Loading dashboard statistics...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <div className="stat-card">
              <h3>Total Students</h3>
              <p>{stats.totalStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Total Staff</h3>
              <p>{stats.totalStaff}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Fees</h3>
              <p>₹{stats.pendingFees?.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Today’s Attendance</h3>
              <p>{stats.todayAttendance}%</p>
            </div>
            <div className="stat-card">
              <h3>Upcoming Exams</h3>
              <p>{stats.upcomingExams}</p>
            </div>
            <div className="stat-card">
              <h3>Active Enquiries</h3>
              <p>{stats.activeEnquiries}</p>
            </div>
          </>
        )}
      </div>
      <p>Use the side navigation to access different modules.</p>
    </div>
  );
};

export default Dashboard;
