import React, { useState, useEffect, useCallback } from 'react';
import { staffAttendanceApi } from '../../services/adminApi';

const StaffAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffList, setStaffList] = useState([]);

  const [attendance, setAttendance] = useState({});
  const [originalAttendance, setOriginalAttendance] = useState({});
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewAttendanceData, setViewAttendanceData] = useState({});
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState({});
  const [showSavedRecords, setShowSavedRecords] = useState(false);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedStaffReport, setSelectedStaffReport] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [viewAttendanceLoading, setViewAttendanceLoading] = useState(false);
  const [monthlyAttendanceLoading, setMonthlyAttendanceLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // Fetch staff list from backend
      const staffResult = await staffAttendanceApi.getStaffList();
      if (staffResult.success) {
        const formattedStaff = staffResult.data.map(staff => ({
          id: staff._id,
          full_name: staff.name,
          designation_name: staff.designation,
          department: staff.department,
          staffId: staff.staffId
        }));
        setStaffList(formattedStaff);
      }

      // Fetch leave requests from backend
      const leaveResult = await staffAttendanceApi.getLeaveRequests();
      if (leaveResult.success) {
        setLeaveRequests(leaveResult.data);
      }
    };
    fetchData();
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (attendanceLoading) return; // Prevent multiple calls
    setAttendanceLoading(true);
    try {
      // Fetch existing attendance data from backend
      const attendanceResult = await staffAttendanceApi.getAttendance(date);
      if (attendanceResult.success) {
        const attendanceMap = {};
        attendanceResult.data.forEach(record => {
          attendanceMap[record.staffId._id] = record.status;
        });

        // For staff without attendance records, check for approved leaves
        staffList.forEach(staff => {
          if (!attendanceMap[staff.id]) {
            const leaveForDate = leaveRequests.find(leave =>
              leave.staffId && leave.staffId._id === staff.id &&
              leave.status === 'approved' &&
              new Date(leave.startDate) <= new Date(date) &&
              new Date(leave.endDate) >= new Date(date)
            );
            if (leaveForDate) {
              attendanceMap[staff.id] = 'LEAVE';
            } else {
              attendanceMap[staff.id] = 'PRESENT'; // Default to PRESENT
            }
          }
        });

        setAttendance(attendanceMap);
        setOriginalAttendance({ ...attendanceMap });
      }
    } finally {
      setAttendanceLoading(false);
    }
  }, [staffList, date, leaveRequests]);

  useEffect(() => {
    if (staffList.length > 0) {
      fetchAttendance();
    }
  }, [date, staffList, fetchAttendance]);

  const fetchViewAttendance = useCallback(async () => {
    if (viewAttendanceLoading) return; // Prevent multiple calls
    setViewAttendanceLoading(true);
    try {
      const result = await staffAttendanceApi.getAttendance(viewDate);
      if (result.success) {
        const attendanceMap = {};
        result.data.forEach(record => {
          attendanceMap[record.staffId._id] = record.status;
        });
        setViewAttendanceData(attendanceMap);
      }
    } finally {
      setViewAttendanceLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    if (showSavedRecords && staffList.length > 0) {
      fetchViewAttendance();
    }
  }, [viewDate, showSavedRecords, staffList, fetchViewAttendance]);

  const fetchMonthlyAttendance = useCallback(async () => {
    if (monthlyAttendanceLoading) return; // Prevent multiple calls
    setMonthlyAttendanceLoading(true);
    setMonthlyError('');
    try {
      const result = await staffAttendanceApi.getMonthlyAttendance(month, year);
      if (result.success) {
        setMonthlyData(result.data);
      } else {
        setMonthlyError(result.error || 'Failed to fetch monthly attendance');
      }
    } catch (error) {
      setMonthlyError('Network error occurred while fetching monthly attendance');
      console.error('Monthly attendance fetch error:', error);
    } finally {
      setMonthlyAttendanceLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    if (showMonthlyView && staffList.length > 0) {
      fetchMonthlyAttendance();
    }
  }, [month, year, showMonthlyView, staffList, fetchMonthlyAttendance]);

  const handleToggle = (staffId) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: prev[staffId] === 'PRESENT' ? 'ABSENT' : (prev[staffId] === 'ABSENT' ? 'LEAVE' : 'PRESENT')
    }));
  };

  const handleLeaveAction = async (leaveId, status) => {
    setLeaveLoading(prev => ({ ...prev, [leaveId]: true }));
    const result = await staffAttendanceApi.updateLeaveStatus(leaveId, status);
    if (result.success) {
      setLeaveRequests(prev => prev.map(leave =>
        leave._id === leaveId ? { ...leave, status } : leave
      ));
      setMessage(`Leave ${status} successfully`);
      setTimeout(() => setMessage(''), 3000);
      // Refresh attendance to reflect leave changes
      fetchAttendance();
    } else {
      setMessage('Failed to update leave status');
      setTimeout(() => setMessage(''), 3000);
    }
    setLeaveLoading(prev => ({ ...prev, [leaveId]: false }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Prepare attendance data for backend
    const attendanceData = Object.keys(attendance).map(staffId => ({
      staffId,
      status: attendance[staffId]
    }));

    const result = await staffAttendanceApi.markAttendance(date, attendanceData);
    if (result.success) {
      setOriginalAttendance({ ...attendance });
      setMessage('Attendance saved successfully');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save attendance');
      setTimeout(() => setMessage(''), 3000);
    }
    setLoading(false);
  };

  const hasChanges = () => {
    return JSON.stringify(attendance) !== JSON.stringify(originalAttendance);
  };

  return (
    <div className="menu-content">
      <h1>Staff Attendance</h1>
      <p>Manage staff attendance records.</p>

      {/* Toggle between marking, viewing saved attendance, and monthly view */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            setShowSavedRecords(false);
            setShowMonthlyView(false);
          }}
          style={{
            backgroundColor: !showSavedRecords && !showMonthlyView ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Mark Attendance
        </button>
        <button
          onClick={() => {
            setShowSavedRecords(true);
            setShowMonthlyView(false);
          }}
          style={{
            backgroundColor: showSavedRecords && !showMonthlyView ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          View Saved Attendance
        </button>
        <button
          onClick={() => {
            setShowSavedRecords(false);
            setShowMonthlyView(true);
          }}
          style={{
            backgroundColor: showMonthlyView ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Monthly Attendance View
        </button>
      </div>

      {showMonthlyView ? (
        <div>
          <h3>Monthly Attendance View</h3>
          <div style={{ marginBottom: '20px' }}>
            <label>Month:</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              style={{ marginLeft: '10px', marginRight: '20px' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <label>Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              style={{ marginLeft: '10px', width: '80px' }}
            />
          </div>

          {monthlyAttendanceLoading ? (
            <p>Loading monthly attendance data...</p>
          ) : monthlyError ? (
            <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '5px', backgroundColor: '#ffe6e6' }}>
              <strong>Error:</strong> {monthlyError}
            </div>
          ) : monthlyData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', position: 'sticky', left: 0, backgroundColor: '#f8f9fa' }}>Staff Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Designation</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Department</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Staff ID</th>
                    {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => (
                      <th key={i + 1} style={{ border: '1px solid #ddd', padding: '8px', minWidth: '50px' }}>
                        {i + 1}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Present</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Absent</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Leave</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map(staffData => {
                    const attendance = staffData.attendance;
                    const presentCount = Object.values(attendance).filter(status => status === 'PRESENT').length;
                    const absentCount = Object.values(attendance).filter(status => status === 'ABSENT').length;
                    const leaveCount = Object.values(attendance).filter(status => status === 'LEAVE').length;
                    return (
                      <tr key={staffData.staff._id}>
                        <td style={{ border: '1px solid #ddd', padding: '8px', position: 'sticky', left: 0, backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                          {staffData.staff.name}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staffData.staff.designation}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staffData.staff.department}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staffData.staff.staffId}</td>
                        {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
                          const day = i + 1;
                          const status = attendance[day];
                          return (
                            <td key={day} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                              <span
                                style={{
                                  backgroundColor: status === 'PRESENT' ? 'green' : status === 'LEAVE' ? 'blue' : status === 'ABSENT' ? 'red' : '#f0f0f0',
                                  color: status ? 'white' : 'black',
                                  padding: '5px',
                                  borderRadius: '3px',
                                  display: 'inline-block',
                                  minWidth: '40px'
                                }}
                              >
                                {status ? status.charAt(0) : '-'}
                              </span>
                            </td>
                          );
                        })}
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'green' }}>{presentCount}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'red' }}>{absentCount}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontWeight: 'bold', color: 'blue' }}>{leaveCount}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStaffReport(selectedStaffReport === staffData.staff._id ? null : staffData.staff._id)}
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedStaffReport === staffData.staff._id ? 'Hide Report' : 'View Report'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No attendance records found for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>
          )}

          {/* Detailed Report Section */}
          {selectedStaffReport && (
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              {(() => {
                const staffData = monthlyData.find(data => data.staff._id === selectedStaffReport);
                if (!staffData) return null;
                const attendance = staffData.attendance;
                const presentCount = Object.values(attendance).filter(status => status === 'PRESENT').length;
                const absentCount = Object.values(attendance).filter(status => status === 'ABSENT').length;
                const leaveCount = Object.values(attendance).filter(status => status === 'LEAVE').length;

                return (
                  <div>
                    <h4>Monthly Attendance Report for {staffData.staff.name}</h4>
                    <div style={{ marginBottom: '20px' }}>
                      <p><strong>Staff ID:</strong> {staffData.staff.staffId}</p>
                      <p><strong>Name:</strong> {staffData.staff.name}</p>
                      <p><strong>Designation:</strong> {staffData.staff.designation}</p>
                      <p><strong>Department:</strong> {staffData.staff.department}</p>
                      <p><strong>Month:</strong> {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>
                      <p><strong>Summary:</strong> Present: {presentCount}, Absent: {absentCount}, Leave: {leaveCount}</p>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Day</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
                            const day = i + 1;
                            const status = attendance[day];
                            return (
                              <tr key={day}>
                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{day}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                  <span
                                    style={{
                                      backgroundColor: status === 'PRESENT' ? 'green' : status === 'LEAVE' ? 'blue' : status === 'ABSENT' ? 'red' : '#f0f0f0',
                                      color: status ? 'white' : 'black',
                                      padding: '5px 10px',
                                      borderRadius: '3px',
                                      display: 'inline-block'
                                    }}
                                  >
                                    {status || 'Not Marked'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : !showSavedRecords ? (
        <>
          <div>
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Staff Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Designation</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Leave Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map(staff => {
            const leaveForDate = leaveRequests.find(leave =>
              leave.staffId && leave.staffId._id === staff.id &&
              new Date(leave.startDate) <= new Date(date) &&
              new Date(leave.endDate) >= new Date(date)
            );
            return (
              <tr key={staff.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staff.full_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staff.designation_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {leaveForDate ? (
                    <div>
                      <span style={{ color: leaveForDate.status === 'approved' ? 'green' : leaveForDate.status === 'rejected' ? 'red' : 'orange' }}>
                        {leaveForDate.status}
                      </span>
                      {leaveForDate.status === 'pending' && (
                        <div style={{ marginTop: '5px' }}>
                          <button
                            onClick={() => handleLeaveAction(leaveForDate._id, 'approved')}
                            disabled={leaveLoading[leaveForDate._id]}
                            style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '2px 5px', marginRight: '5px', cursor: 'pointer' }}
                          >
                            {leaveLoading[leaveForDate._id] ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leaveForDate._id, 'rejected')}
                            disabled={leaveLoading[leaveForDate._id]}
                            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '2px 5px', cursor: 'pointer' }}
                          >
                            {leaveLoading[leaveForDate._id] ? '...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    'No leave'
                  )}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => setAttendance(prev => ({ ...prev, [staff.id]: 'PRESENT' }))}
                      style={{
                        backgroundColor: attendance[staff.id] === 'PRESENT' ? 'green' : '#f0f0f0',
                        color: attendance[staff.id] === 'PRESENT' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                    >
                      PRESENT
                    </button>
                    <button
                      onClick={() => setAttendance(prev => ({ ...prev, [staff.id]: 'ABSENT' }))}
                      style={{
                        backgroundColor: attendance[staff.id] === 'ABSENT' ? 'red' : '#f0f0f0',
                        color: attendance[staff.id] === 'ABSENT' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                    >
                      ABSENT
                    </button>
                    <button
                      onClick={() => setAttendance(prev => ({ ...prev, [staff.id]: 'LEAVE' }))}
                      style={{
                        backgroundColor: attendance[staff.id] === 'LEAVE' ? 'blue' : '#f0f0f0',
                        color: attendance[staff.id] === 'LEAVE' ? 'white' : 'black',
                        border: '1px solid #ccc',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        borderRadius: '3px'
                      }}
                    >
                      LEAVE
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <button
        onClick={handleSave}
        disabled={!hasChanges() || loading}
        style={{
          marginTop: '20px',
          backgroundColor: hasChanges() ? '#007bff' : '#6c757d',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: hasChanges() ? 'pointer' : 'not-allowed',
          fontSize: '16px'
        }}
      >
        {loading ? 'Saving...' : 'Save Attendance'}
      </button>
      {message && <div style={{ marginTop: '10px', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
        </>
      ) : (
        <div>
          <h3>Saved Attendance Records</h3>
          <div style={{ marginBottom: '20px' }}>
            <label>Select Date to View:</label>
            <input
              type="date"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>

          {Object.keys(viewAttendanceData).length > 0 ? (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Staff Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Designation</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(staff => (
                    <tr key={staff.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staff.full_name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{staff.designation_name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <span
                          style={{
                            backgroundColor: viewAttendanceData[staff.id] === 'PRESENT' ? 'green' : viewAttendanceData[staff.id] === 'LEAVE' ? 'blue' : 'red',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '3px'
                          }}
                        >
                          {viewAttendanceData[staff.id] || 'Not Marked'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No attendance records found for {viewDate}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffAttendance;
