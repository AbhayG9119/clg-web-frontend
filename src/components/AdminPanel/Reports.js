import React, { useState } from 'react';
import './Reports.css';

const descriptions = {
  'Fees Report': 'This report provides details on fee collections, including student IDs, amounts paid/unpaid, and transaction dates.',
  'Staff Report': 'View staff information such as IDs, names, departments, roles, and active status.',
  'Certificate Report': 'Track certificate issuance for students, including types, statuses, and dates.',
  'Circular Report': 'List circulars and notices, targeted roles, and their active status.',
  'Work Management Report': 'Monitor assigned tasks, staff involved, completion status, and dates.',
  'Expense Report': 'Summarize expenses by category, department, amounts, and dates.',
  'Enquiry Report': 'Review enquiries from various sources, details, statuses, and dates.',
  'Collection Report': 'View fee collection statistics by course, year, and semester.',
  'Defaulter Report': 'List students with outstanding fee payments.',
  'Payment Statistics': 'Comprehensive payment statistics and trends.',
  'Concession Report': 'Track concessions and scholarships granted to students.',
  'Receipt Report': 'View generated receipts and their status.'
};

const reportTypes = [
  'Fees Report',
  'Staff Report',
  'Certificate Report',
  'Circular Report',
  'Work Management Report',
  'Expense Report',
  'Enquiry Report',
  'Collection Report',
  'Defaulter Report',
  'Payment Statistics',
  'Concession Report',
  'Receipt Report'
];

const filterOptions = {
  'Fees Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Student ID', type: 'text', id: 'student-id' },
    { label: 'Status', type: 'select', options: ['Paid', 'Unpaid'], id: 'status' }
  ],
  'Staff Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Staff ID', type: 'text', id: 'staff-id' },
    { label: 'Department', type: 'select', options: ['IT', 'HR', 'Finance'], id: 'department' },
    { label: 'Status', type: 'select', options: ['Active', 'Inactive'], id: 'status' },
    { label: 'Role', type: 'select', options: ['Teacher', 'Admin'], id: 'role' }
  ],
  'Certificate Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Student ID', type: 'text', id: 'student-id' },
    { label: 'Status', type: 'select', options: ['Issued', 'Pending'], id: 'status' }
  ],
  'Circular Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Role', type: 'select', options: ['All', 'Staff', 'Students'], id: 'role' },
    { label: 'Status', type: 'select', options: ['Active', 'Inactive'], id: 'status' }
  ],
  'Work Management Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Staff ID', type: 'text', id: 'staff-id' },
    { label: 'Status', type: 'select', options: ['Completed', 'Pending'], id: 'status' }
  ],
  'Expense Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Category', type: 'select', options: ['Office', 'Travel', 'Maintenance'], id: 'category' },
    { label: 'Department', type: 'select', options: ['IT', 'HR', 'Finance'], id: 'department' }
  ],
  'Enquiry Report': [
    { label: 'Date Range (From)', type: 'date', id: 'startDate' },
    { label: 'Date Range (To)', type: 'date', id: 'endDate' },
    { label: 'Source', type: 'select', options: ['Website', 'Phone', 'Walk-in'], id: 'source' },
    { label: 'Status', type: 'select', options: ['Open', 'Closed'], id: 'status' }
  ],
  'Collection Report': [
    { label: 'Course', type: 'select', options: ['B.A', 'B.Sc', 'B.Ed'], id: 'course' },
    { label: 'Year', type: 'number', id: 'year' },
    { label: 'Semester', type: 'number', id: 'semester' },
    { label: 'Batch', type: 'text', id: 'batch' },
    { label: 'Start Date', type: 'date', id: 'startDate' },
    { label: 'End Date', type: 'date', id: 'endDate' }
  ],
  'Defaulter Report': [
    { label: 'Course', type: 'select', options: ['B.A', 'B.Sc', 'B.Ed'], id: 'course' },
    { label: 'Year', type: 'number', id: 'year' },
    { label: 'Semester', type: 'number', id: 'semester' },
    { label: 'Days Overdue', type: 'number', id: 'daysOverdue' }
  ],
  'Payment Statistics': [
    { label: 'Course', type: 'select', options: ['B.A', 'B.Sc', 'B.Ed'], id: 'course' },
    { label: 'Year', type: 'number', id: 'year' },
    { label: 'Semester', type: 'number', id: 'semester' }
  ],
  'Concession Report': [
    { label: 'Course', type: 'select', options: ['B.A', 'B.Sc', 'B.Ed'], id: 'course' },
    { label: 'Academic Year', type: 'number', id: 'academicYear' },
    { label: 'Semester', type: 'number', id: 'semester' },
    { label: 'Type', type: 'text', id: 'type' }
  ],
  'Receipt Report': [
    { label: 'Course', type: 'select', options: ['B.A', 'B.Sc', 'B.Ed'], id: 'course' },
    { label: 'Year', type: 'number', id: 'year' },
    { label: 'Semester', type: 'number', id: 'semester' },
    { label: 'Start Date', type: 'date', id: 'startDate' },
    { label: 'End Date', type: 'date', id: 'endDate' }
  ]
};

const Reports = () => {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [filters, setFilters] = useState({});
  const [reportData, setReportData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReportTypeChange = (e) => {
    setSelectedReportType(e.target.value);
    setFilters({});
    setReportData([]);
  };

  const handleFilterChange = (id, value) => {
    setFilters({ ...filters, [id]: value });
  };

  const generateReport = async () => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let queryParams = new URLSearchParams();

      // Build query parameters from filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      // Determine API endpoint based on report type
      switch (selectedReportType) {
        case 'Collection Report':
          endpoint = `http://localhost:5000/api/reports/collections?${queryParams}`;
          break;
        case 'Defaulter Report':
          endpoint = `http://localhost:5000/api/reports/defaulters?${queryParams}`;
          break;
        case 'Payment Statistics':
          endpoint = `http://localhost:5000/api/reports/payments/stats?${queryParams}`;
          break;
        case 'Concession Report':
          endpoint = `http://localhost:5000/api/reports/concessions?${queryParams}`;
          break;
        case 'Receipt Report':
          endpoint = `http://localhost:5000/api/reports/receipts?${queryParams}`;
          break;
        case 'Fees Report':
          endpoint = `http://localhost:5000/api/payments/all?${queryParams}`;
          break;
        default:
          // For other reports, use dummy data for now
          setReportData(getDummyData(selectedReportType));
          setLoading(false);
          return;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(Array.isArray(data) ? data : [data]);
        setMessage('Report generated successfully');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to generate report');
        setReportData([]);
      }
    } catch (error) {
      setMessage('Error generating report: ' + error.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const getDummyData = (reportType) => {
    // Keep dummy data for non-fee related reports
    switch (reportType) {
      case 'Staff Report':
        return [
          { id: 1, staffId: 'ST001', name: 'John Doe', department: 'IT', status: 'Active', role: 'Teacher' },
          { id: 2, staffId: 'ST002', name: 'Jane Smith', department: 'HR', status: 'Active', role: 'Admin' }
        ];
      case 'Certificate Report':
        return [
          { id: 1, studentId: 'S001', type: 'Transfer', status: 'Issued', date: '2023-01-01' },
          { id: 2, studentId: 'S002', type: 'Character', status: 'Pending', date: '2023-01-02' }
        ];
      case 'Circular Report':
        return [
          { id: 1, title: 'Holiday Notice', role: 'All', status: 'Active', date: '2023-01-01' },
          { id: 2, title: 'Exam Schedule', role: 'Students', status: 'Active', date: '2023-01-02' }
        ];
      case 'Work Management Report':
        return [
          { id: 1, staffId: 'ST001', task: 'Update Website', status: 'Completed', date: '2023-01-01' },
          { id: 2, staffId: 'ST002', task: 'Prepare Report', status: 'Pending', date: '2023-01-02' }
        ];
      case 'Expense Report':
        return [
          { id: 1, category: 'Office', amount: 2000, department: 'IT', date: '2023-01-01' },
          { id: 2, category: 'Travel', amount: 1500, department: 'HR', date: '2023-01-02' }
        ];
      case 'Enquiry Report':
        return [
          { id: 1, source: 'Website', details: 'Admission Query', status: 'Open', date: '2023-01-01' },
          { id: 2, source: 'Phone', details: 'Fee Structure', status: 'Closed', date: '2023-01-02' }
        ];
      default:
        return [];
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...reportData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredData = sortedData.filter(item =>
    Object.values(item).some(val => val.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    alert('Export to Excel functionality would be implemented here.');
  };

  const exportToPDF = () => {
    alert('Export to PDF functionality would be implemented here.');
  };

  return (
    <div className="menu-content">
      <h1>Report Generator</h1>

      {!selectedReportType && (
        <div className="section">
          <p>Welcome to the Reports Module. Here you can generate various reports for the school management system. Select a report type from the dropdown below to get started.</p>
        </div>
      )}

      {/* Section 1: Select Report Type */}
      <div className="section">
        <label>Report Type</label>
        <select value={selectedReportType} onChange={handleReportTypeChange}>
          <option value="">Select Report Type</option>
          {reportTypes.map(reportType => <option key={reportType} value={reportType}>{reportType}</option>)}
        </select>
        {selectedReportType && (
          <p className="report-description">{descriptions[selectedReportType]}</p>
        )}
      </div>

      {/* Section 2: Apply Filters */}
      {selectedReportType && (
        <div className="section">
          <h3>Filters</h3>
          {filterOptions[selectedReportType].map(filter => (
            <div key={filter.id} className="filter-item">
              <label>{filter.label}</label>
              {filter.type === 'text' && (
                <input
                  type="text"
                  id={`filter-${filter.id}`}
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                />
              )}
              {filter.type === 'date' && (
                <input
                  type="date"
                  id={`filter-${filter.id}`}
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                />
              )}
              {filter.type === 'select' && (
                <select
                  id={`filter-${filter.id}`}
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                >
                  <option value="">Select</option>
                  {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
              {filter.type === 'number' && (
                <input
                  type="number"
                  id={`filter-${filter.id}`}
                  value={filters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Generate Report */}
      {selectedReportType && (
        <div className="section">
          <button className="btn" onClick={generateReport} disabled={loading}>
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      )}

      {/* Loading and Message Display */}
      {loading && (
        <div className="section">
          <div className="loading-message">Generating report, please wait...</div>
        </div>
      )}

      {message && (
        <div className={`section message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Section 4: Report Output */}
      {reportData.length > 0 && (
        <div className="section">
          <h3>Report Results</h3>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <table className="report-table">
            <thead>
              <tr>
                {Object.keys(reportData[0]).map(key => (
                  <th key={key} onClick={() => handleSort(key)} style={{ cursor: 'pointer' }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map(item => (
                <tr key={item.id}>
                  {Object.values(item).map((val, idx) => <td key={idx}>{val}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * itemsPerPage >= filteredData.length}>Next</button>
          </div>
        </div>
      )}

      {/* Section 5: Export Options */}
      {reportData.length > 0 && (
        <div className="section">
          <h3>Export Report</h3>
          <button className="btn" onClick={exportToExcel}>Export to Excel</button>
          <button className="btn" onClick={exportToPDF}>Export to PDF</button>
        </div>
      )}
    </div>
  );
};

export default Reports;
