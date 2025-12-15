import React, { useState, useEffect } from 'react';
import { auth, feesApi } from '../../services/adminApi';

const DetailedProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');

        // Get current user
        const userResult = await auth.getCurrentUser();
        if (!userResult.success) {
          setError('Failed to get user information');
          return;
        }

        const userId = userResult.data.id;

        // Get student profile
        const profileResult = await feesApi.getStudentProfile(userId, 'student');
        if (profileResult.success) {
          setProfile(profileResult.data);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (err) {
        setError('Error loading profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="menu-content">
        <h1>Detailed Profile</h1>
        <p>Loading your profile information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-content">
        <h1>Detailed Profile</h1>
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#ffebee',
          color: '#c62828'
        }}>
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="menu-content">
        <h1>Detailed Profile</h1>
        <p>No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="menu-content">
      <h1>Detailed Profile</h1>
      <p>This is a detailed view of your profile information. Here you can find comprehensive details about your academic and personal information.</p>

      <div style={{ marginTop: '20px' }}>
        <h2>Academic Information</h2>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>Student ID:</strong> {profile.studentId || 'N/A'}</p>
          <p><strong>Enrollment Number:</strong> {profile.rollNo || 'N/A'}</p>
          <p><strong>Course:</strong> {profile.department || 'N/A'}</p>
          <p><strong>Branch:</strong> {profile.section || 'N/A'}</p>
          <p><strong>Current Semester:</strong> {profile.semester || 'N/A'}</p>
          <p><strong>Academic Year:</strong> {profile.year || 'N/A'}</p>
          <p><strong>Session ID:</strong> {profile.sessionId?.sessionId || profile.sessionId || 'N/A'}</p>
          <p><strong>Batch ID:</strong> {profile.batchId || 'N/A'}</p>
          <p><strong>Admission Year:</strong> {profile.admissionYear || 'N/A'}</p>
        </div>

        <h2>Personal Information</h2>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
          <p><strong>Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Gender:</strong> {profile.gender || 'N/A'}</p>
          <p><strong>Blood Group:</strong> {profile.bloodGroup || 'N/A'}</p>
          <p><strong>Guardian Name:</strong> {profile.guardianName || 'N/A'}</p>
          <p><strong>Guardian Contact:</strong> {profile.guardianContact || 'N/A'}</p>
        </div>

        <h2>Contact Information</h2>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>Permanent Address:</strong> {profile.address ? `${profile.address.street || ''}, ${profile.address.city || ''}, ${profile.address.state || ''}, ${profile.address.pincode || ''}`.replace(/^, |, $/, '') : 'N/A'}</p>
          <p><strong>Phone Number:</strong> {profile.mobileNumber || 'N/A'}</p>
        </div>

        <h2>Documents</h2>
        <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <p><strong>Marksheet:</strong> {profile.documents?.marksheet || 'N/A'}</p>
          <p><strong>ID Proof:</strong> {profile.documents?.idProof || 'N/A'}</p>
          <p><strong>Photo:</strong> {profile.documents?.photo || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailedProfile;
