// This component is deprecated. Staff registration is now handled in AddUser.js
// Keeping this file for reference or future use if needed.

import React, { useState, useEffect } from 'react';
import { staffApi } from '../../services/adminApi';

const RegisterStaff = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    designationId: '',
    department: '',
    subject: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    staffId: '',
    role: 'faculty'
  });
  const [designations, setDesignations] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDesignations = async () => {
      const result = await staffApi.getDesignations();
      if (result.success) {
        setDesignations(result.data);
      }
    };
    fetchDesignations();
  }, []);

  useEffect(() => {
    const { fullName, email, password, phoneNumber, gender, designationId, department, subject, joiningDate, staffId } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const dobValid = !formData.dateOfBirth || new Date(formData.dateOfBirth) <= new Date();
    setIsValid(
      fullName.trim().length > 0 && fullName.length <= 100 &&
      emailRegex.test(email) &&
      password.trim().length >= 6 &&
      phoneRegex.test(phoneNumber) &&
      gender &&
      designationId &&
      department.trim().length > 0 &&
      subject.trim().length > 0 &&
      joiningDate &&
      staffId.trim().length > 0 &&
      dobValid
    );
  }, [formData]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    // Map formData to match backend expectations
    const mappedData = {
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      designation: designations.find(d => d._id === formData.designationId)?.name || '',
      department: formData.department,
      subject: formData.subject,
      staffId: formData.staffId,
      phone: formData.phoneNumber,
      address: formData.address,
      joiningDate: formData.joiningDate,
      qualifications: '', // Optional
      subjectsTaught: [] // Optional
    };

    setLoading(true);
    const result = await staffApi.registerStaff(mappedData);
    setLoading(false);
    if (result.success) {
      setMessage('Staff registered successfully');
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        gender: '',
        dateOfBirth: '',
        designationId: '',
        department: '',
        subject: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
        staffId: '',
        role: 'faculty'
      });
    } else {
      setMessage(result.error || 'Failed to register staff');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="menu-content">
      <h1>Register Staff (Deprecated)</h1>
      <p>This component is deprecated. Use AddUser.js for staff registration.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            pattern="\d{10}"
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label>Designation:</label>
          <select name="designationId" value={formData.designationId} onChange={handleChange} required>
            <option value="">Select Designation</option>
            {designations.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Subject:</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </div>
        <div>
          <label>Joining Date:</label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Staff ID:</label>
          <input
            type="text"
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            maxLength={250}
          />
        </div>
        <button type="submit" disabled={!isValid || loading}>
          {loading ? 'Registering...' : 'Register Staff'}
        </button>
      </form>
      {message && <div style={{ marginTop: '10px', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
    </div>
  );
};

export default RegisterStaff;
