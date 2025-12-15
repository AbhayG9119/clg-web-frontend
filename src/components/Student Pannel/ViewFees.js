import React, { useState, useEffect } from 'react';
import FeeSummaryTable from '../AdminPanel/FeeSummaryTable';

const ViewFees = () => {
  const [feeStructure, setFeeStructure] = useState(null);
  const [payments, setPayments] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('fees');
  const [paymentType, setPaymentType] = useState('semester');
  const [feeSummary, setFeeSummary] = useState([]);

  useEffect(() => {
    fetchStudentInfo();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (studentInfo?.department) {
      fetchFeeStructure(studentInfo.department);
    }
  }, [studentInfo]);

  useEffect(() => {
    if (feeStructure && payments.length >= 0) {
      const summary = calculateFeeSummary(payments);
      setFeeSummary(summary);
    }
  }, [feeStructure, payments]);

  const fetchStudentInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentInfo(data);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const fetchFeeStructure = async (course) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/fees/${course}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFeeStructure(data);
      }
    } catch (error) {
      console.error('Error fetching fee structure:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/my-payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const getStudentFeeStructure = () => {
    return feeStructure;
  };

  const calculateFeeAmount = (structure, type) => {
    if (!structure) return 0;
    const total = structure.totalFee;
    return type === 'semester' ? total / 2 : total;
  };

  const initiatePayment = async () => {
    if (!studentInfo || !getStudentFeeStructure()) {
      setMessage('Unable to process payment. Student information or fee structure not found.');
      return;
    }

    const structure = getStudentFeeStructure();
    const amount = calculateFeeAmount(structure, paymentType);

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          course: studentInfo.department,
          year: studentInfo.year,
          semester: studentInfo.semester,
          paymentType,
          amount
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Payment initiated successfully! Please complete the payment process.');
        fetchPayments();
      } else {
        setMessage(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      setMessage('Error initiating payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFeeSummary = (payments) => {
    if (!feeStructure) return [];

    const feeHeads = [
      { head: 'Tuition Fee', total: feeStructure.feeComponents.tuitionFee },
      { head: 'Library Fee', total: feeStructure.feeComponents.libraryFee },
      { head: 'Laboratory Fee', total: feeStructure.feeComponents.laboratoryFee },
      { head: 'Examination Fee', total: feeStructure.feeComponents.examinationFee },
      { head: 'Sports Fee', total: feeStructure.feeComponents.sportsFee },
      { head: 'Development Fee', total: feeStructure.feeComponents.developmentFee },
      { head: 'Miscellaneous', total: feeStructure.feeComponents.miscellaneousFee }
    ];

    // Calculate total paid amount
    const totalPaid = payments.reduce((sum, payment) => {
      if (payment.status === 'Paid') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    // Allocate payments starting from Tuition Fee, then Library, then Sports, then Exam, etc.
    let remainingPaid = totalPaid;
    return feeHeads.map(fee => {
      const paidForThisFee = Math.min(remainingPaid, fee.total);
      remainingPaid -= paidForThisFee;
      return {
        head: fee.head,
        amount: fee.total,
        paid: paidForThisFee,
        balance: Math.max(0, fee.total - paidForThisFee)
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#28a745';
      case 'Pending': return '#ffc107';
      case 'Failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const structure = getStudentFeeStructure();
  const currentFeeAmount = calculateFeeAmount(structure, paymentType);

  return (
    <div className="menu-content">
      <h1>My Fees</h1>
      <p>View your fee structure and payment history.</p>

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: message.includes('Error') || message.includes('Failed') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') || message.includes('Failed') ? '#c62828' : '#2e7d32'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('fees')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'fees' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fee Details
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'payments' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Payment History
        </button>
      </div>

      {activeTab === 'fees' && (
        <div>
          <h3>Fees Summary</h3>
          {studentInfo && feeSummary.length > 0 && (
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Fee Head</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Total Amount</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Paid</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {feeSummary.map((fee, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: fee.head === 'Tuition Fee' ? 'bold' : 'normal' }}>
                        {fee.head}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        ₹{fee.paid.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                        ₹{fee.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#e7f3ff' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                      ₹{feeSummary.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                      ₹{feeSummary.reduce((sum, fee) => sum + fee.paid, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                      ₹{feeSummary.reduce((sum, fee) => sum + fee.balance, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {!feeSummary.length && studentInfo && (
            <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
              <p>No fee summary available for your course: {studentInfo.department}</p>
            </div>
          )}

          {structure && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                border: '2px solid #007bff',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#e7f3ff',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                  Total Annual Fee: ₹{structure.totalFee.toLocaleString()}
                </p>
                <p>Semester Fee: ₹{(structure.totalFee / 2).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <h4>Submit Fee Payment</h4>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
              <label>
                <input
                  type="radio"
                  value="semester"
                  checked={paymentType === 'semester'}
                  onChange={(e) => setPaymentType(e.target.value)}
                />
                Pay for Semester (₹{structure ? (structure.totalFee / 2).toLocaleString() : 0})
              </label>
              <label>
                <input
                  type="radio"
                  value="year"
                  checked={paymentType === 'year'}
                  onChange={(e) => setPaymentType(e.target.value)}
                />
                Pay for Year (₹{structure ? structure.totalFee.toLocaleString() : 0})
              </label>
            </div>

            <button
              onClick={initiatePayment}
              disabled={loading || !structure}
              style={{
                padding: '12px 24px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !structure ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Processing...' : `Submit Payment ₹${currentFeeAmount.toLocaleString()} for ${paymentType === 'semester' ? 'Semester' : 'Year'}`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <h3>Payment History</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {payments.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Year</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Semester</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.year}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.semester}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {payment.paymentType}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        ₹{payment.amount}
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: getStatusColor(payment.status),
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No payment records found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewFees;
