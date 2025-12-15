
import React, { useState } from 'react';
import StudentSearch from './StudentSearch';
import { feesApi } from '../../services/adminApi';

const EditStudentProfile = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    },
    guardianName: '',
    guardianContact: '',
    section: '',
    department: '',
    year: '',
    semester: '',
    rollNo: '',
    sessionId: '',
    batchId: '',
    admissionYear: '',
    // documents removed as they are handled separately
  });

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student);
    setLoading(true);
    setMessage('');

    try {
      const result = await feesApi.getStudentProfile(student._id, 'student');
      if (result.success) {
        const profile = result.data;
        setFormData({
          name: profile.name || '',
          mobileNumber: profile.mobileNumber || '',
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          gender: profile.gender || '',
          bloodGroup: profile.bloodGroup || '',
          address: {
            street: profile.address?.street || '',
            city: profile.address?.city || '',
            state: profile.address?.state || '',
            pincode: profile.address?.pincode || ''
          },
          guardianName: profile.guardianName || '',
          guardianContact: profile.guardianContact || '',
          section: profile.section || '',
          department: profile.department || '',
          year: profile.year || '',
          semester: profile.semester || '',
          rollNo: profile.rollNo || '',
          sessionId: profile.sessionId || '',
          batchId: profile.batchId || '',
          admissionYear: profile.admissionYear || '',
          // documents: profile.documents || []
        });
      } else {
        setMessage('Failed to fetch student profile');
      }
    } catch (error) {
      setMessage('Error fetching student profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setMessage('Please select a student first');
      return;
    }

    // Validate required address fields
    if (!formData.address.street.trim() || !formData.address.city.trim() || !formData.address.state.trim() || !formData.address.pincode.trim()) {
      setMessage('Please fill all address fields (street, city, state, pincode)');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await feesApi.updateStudentProfile(selectedStudent._id, 'student', formData);
      if (result.success) {
        setMessage('Student profile updated successfully!');
      } else {
        setMessage('Failed to update student profile');
      }
    } catch (error) {
      setMessage('Error updating student profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-content">
      <h1>Edit Student Profile</h1>
      <p>Select a student and edit their detailed profile information including admission data</p>

      <div style={{ marginBottom: '20px' }}>
        <StudentSearch
          onStudentSelect={handleStudentSelect}
          placeholder="Search student by ID, name, class..."
        />
      </div>

      {selectedStudent && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9'
        }}>
          <strong>Selected Student:</strong> {selectedStudent.name} (ID: {selectedStudent.id})
        </div>
      )}

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') || message.includes('Failed') ? '#c62828' : '#2e7d32',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}

      {selectedStudent && (
        <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
          {/* Basic Information */}
          <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
            <legend><strong>Basic Information</strong></legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Mobile Number:</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </fieldset>

          {/* Personal Details */}
          <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
            <legend><strong>Personal Details</strong></legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Gender:</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label>Blood Group:</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginTop: '15px' }}>
              <h4>Address</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    required
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

            {/* Guardian Details */}
            <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Guardian Name:</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Guardian Contact:</label>
                <input
                  type="tel"
                  name="guardianContact"
                  value={formData.guardianContact}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          </fieldset>

          {/* Academic Details */}
          <fieldset style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd' }}>
            <legend><strong>Academic Details</strong></legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label>Department:</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Year:</label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Semester:</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Section:</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  placeholder="e.g., A, B, C"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div>
                <label>Roll No:</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Session ID:</label>
                <input
                  type="text"
                  name="sessionId"
                  value={formData.sessionId?.sessionId || formData.sessionId || ''}
                  readOnly
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                />
              </div>
              <div>
                <label>Batch ID:</label>
                <input
                  type="text"
                  name="batchId"
                  value={formData.batchId}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Admission Year:</label>
                <input
                  type="text"
                  name="admissionYear"
                  value={formData.admissionYear}
                  readOnly
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                />
              </div>
            </div>
          </fieldset>



          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditStudentProfile;
