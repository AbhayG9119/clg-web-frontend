import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { expenseApi } from '../../services/adminApi';

const ExpenseReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    page: 1,
    limit: 20
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      window.location.href = '/login';
    }
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    const result = await expenseApi.getExpenses(filters);
    if (result.success) {
      setExpenses(result.data.expenses);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    setLoading(true);
    const result = await expenseApi.getExpenseReport(startDate, endDate);

    if (result.success) {
      setReport(result.data);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '30px'
      }}>
        <h1 style={{
          color: '#333',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>Expense Reports</h1>

        {/* Report Generation Section */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            color: '#555',
            marginBottom: '20px',
            fontSize: '20px',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px'
          }}>Generate Expense Report</h2>

          <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#555'
              }}>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#555'
              }}>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Summary */}
        {report && (
          <div style={{
            backgroundColor: '#e9ecef',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2 style={{
              color: '#333',
              marginBottom: '20px',
              fontSize: '22px'
            }}>Report Summary</h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#007bff', margin: '0 0 10px 0' }}>Total Expenses</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                  ₹{report.grand_total.toFixed(2)}
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '5px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#28a745', margin: '0 0 10px 0' }}>Total Items</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>
                  {report.totalExpenses}
                </p>
              </div>
            </div>

            <h3 style={{ color: '#555', marginBottom: '15px' }}>Category Breakdown:</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              {report.report.map((item, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  borderRadius: '5px',
                  border: '1px solid #ddd'
                }}>
                  <strong style={{ color: '#333' }}>{item.category}:</strong>
                  <span style={{ float: 'right', fontWeight: 'bold', color: '#007bff' }}>
                    ₹{item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense List with Filters */}
        <div>
          <h2 style={{
            color: '#555',
            marginBottom: '20px',
            fontSize: '20px',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px'
          }}>All Expenses</h2>

          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
                color: '#555'
              }}>Filter by Category:</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              >
                <option value="">All Categories</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Travel">Travel</option>
                <option value="Utilities">Utilities</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '10px 15px',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              Total: ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Expense Table */}
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Notes</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px' }}>{expense.category}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#007bff' }}>
                        ₹{expense.amount.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', maxWidth: '200px', wordWrap: 'break-word' }}>
                        {expense.notes || '-'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {expense.attachment ? (
                          <a
                            href={`http://localhost:5000/uploads/${expense.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#007bff', textDecoration: 'none' }}
                          >
                            View
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReports;
