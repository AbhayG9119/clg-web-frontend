import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import userApi from '../../api/userApi'; // Add this import for userApi

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'B.A',
    mobileNumber: '',
    designation: '',
    subject: '',
    subjectsTaught: '',
    qualifications: '',
    joiningDate: '',
    phone: '',
    address: '',
    staffId: '',
    sessionId: '',
    batchId: '',
    admissionYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    // Temporary fixed designations list to avoid staffApi undefined error
    const designationsFixed = [
      { _id: '1', name: 'Professor' },
      { _id: '2', name: 'Assistant Professor' },
      { _id: '3', name: 'Lecturer' },
      { _id: '4', name: 'Fees Administrator' }
    ];
    setDesignations(designationsFixed);
    
    // Fetch initial sessions for default department
    const fetchInitialSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/erp/sessions?department=B.A', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching initial sessions:', error);
      }
    };
    fetchInitialSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If department changes, fetch sessions for that department and reset session/batch
    if (name === 'department' && value) {
      const fetchSessionsForDepartment = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/erp/sessions?department=${value}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setSessions(data);
          }
        } catch (error) {
          console.error('Error fetching sessions:', error);
        }
      };
      fetchSessionsForDepartment();
      setFormData(prev => ({
        ...prev,
        sessionId: '',
        batchId: '',
        admissionYear: ''
      }));
    }

    // If session changes, fetch batches for that session and autofill admission year
    if (name === 'sessionId' && value) {
      const selectedSession = sessions.find(s => s._id === value);
      if (selectedSession && selectedSession.batches) {
        setBatches(selectedSession.batches);
        setFormData(prev => ({
          ...prev,
          batchId: '', // Reset batch selection
          admissionYear: selectedSession.sessionId.split('-')[0] // Autofill admission year
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // General validation
    if (!formData.email.trim()) {
      toast.error('Email is required.');
      return;
    }
    if (!formData.password.trim()) {
      toast.error('Password is required.');
      return;
    }
    if (formData.role !== 'admin' && !formData.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    // Role-specific validation
    if (formData.role === 'student') {
      if (!formData.mobileNumber.trim()) {
        toast.error('Mobile number is required for students.');
        return;
      }
      if (!formData.sessionId) {
        toast.error('Academic session is required for students.');
        return;
      }
      if (!formData.batchId) {
        toast.error('Batch is required for students.');
        return;
      }
      if (!formData.department) {
        toast.error('Department is required for students.');
        return;
      }
    } else if (formData.role === 'faculty') {
      if (!formData.staffId.trim()) {
        toast.error('Staff ID is required for faculty.');
        return;
      }
      if (!formData.designation) {
        toast.error('Designation is required for faculty.');
        return;
      }
      if (formData.designation !== 'Fees Administrator') {
        if (!formData.department) {
          toast.error('Department is required for this designation.');
          return;
        }
        if (!formData.subject.trim()) {
          toast.error('Subject is required for this designation.');
          return;
        }
      }
    }

    setLoading(true);

    try {
      let submitData = {};
      if (formData.role === 'student') {
        // Prepare student data payload according to backend expectations
        submitData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'student',
          department: formData.department,
          mobileNumber: formData.mobileNumber.trim(),
          sessionId: formData.sessionId,
          batchId: formData.batchId,
          admissionYear: formData.admissionYear || new Date().getFullYear()
        };
      } else if (formData.role === 'faculty') {
        submitData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'faculty',
          designation: formData.designation,
          staffId: formData.staffId.trim(),
          subjectsTaught: formData.subjectsTaught ? formData.subjectsTaught.split(',').map(s => s.trim()) : [],
          qualifications: formData.qualifications,
          joiningDate: formData.joiningDate || new Date().toISOString().split('T')[0],
          phone: formData.phone,
          address: formData.address
        };
        if (formData.designation !== 'Fees Administrator') {
          submitData.department = formData.department;
          submitData.subject = formData.subject;
        }
      } else if (formData.role === 'admin') {
        submitData = {
          email: formData.email.trim(),
          password: formData.password,
          role: 'admin'
        };
      }

      const result = await userApi.addUser(submitData);

      if (result.success) {
        toast.success('User added successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: 'B.A',
          mobileNumber: '',
          designation: '',
          subject: '',
          subjectsTaught: '',
          qualifications: '',
          joiningDate: '',
          phone: '',
          address: '',
          staffId: '',
          sessionId: '',
          batchId: '',
          admissionYear: ''
        });
        // Optionally refresh the page or update state to show new user
        // window.location.reload(); // Uncomment if you want to refresh
      } else {
        toast.error(result.error || 'Failed to add user');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-content">
      <h1>Add User</h1>
      <p>Register new users with roles: Admin, Faculty, Student.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="admin">Admin</option>
            <option value="faculty">Faculty</option>
            <option value="student">Student</option>
          </select>
        </div>

        {formData.role === 'student' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="B.A">B.A</option>
                <option value="B.Sc">B.Sc</option>
                <option value="B.Ed">B.Ed</option>
              </select>
            </div>



            <div style={{ marginBottom: '15px' }}>
              <label>Mobile Number:</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Academic Session:</label>
              <select
                name="sessionId"
                value={formData.sessionId}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Session</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {session.sessionId} ({new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Admission Year:</label>
              <input
                type="text"
                name="admissionYear"
                value={formData.admissionYear}
                readOnly
                style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Batch:</label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                required
                disabled={!formData.sessionId}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch.batchId} value={batch.batchId}>
                    {batch.batchId} (Year {batch.year}, {batch.department})
                  </option>
                ))}
              </select>
            </div>


          </>
        )}

        {formData.role === 'faculty' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Staff ID:</label>
              <input
                type="text"
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Designation:</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">Select Designation</option>
                {designations.map(d => (
                  <option key={d._id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {formData.designation !== 'Fees Administrator' && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label>Department:</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  >
                    <option value="B.A">B.A</option>
                    <option value="B.Sc">B.Sc</option>
                    <option value="B.Ed">B.Ed</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Subject:</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label>Subjects Taught (comma-separated):</label>
                  <input
                    type="text"
                    name="subjectsTaught"
                    value={formData.subjectsTaught}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics, Physics"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
              </>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label>Qualifications:</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Joining Date:</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Adding User...' : 'Add User'}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
