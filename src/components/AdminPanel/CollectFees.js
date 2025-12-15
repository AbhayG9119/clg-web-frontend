import React, { useState, useEffect, useRef } from 'react';
import StudentSearch from './StudentSearch';
import FeeSummaryTable from './FeeSummaryTable';
import ReceiptViewer from './ReceiptViewer';
import Alert from './Alert';
import { feesApi } from '../../services/adminApi';
import './CollectFees.css';

const CollectFees = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [fees, setFees] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: '',
    remarks: ''
  });
  const [receipt, setReceipt] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const paymentModes = ['Online', 'Offline'];

  // Ref to keep track of assigned serial numbers for students by ID
  const studentSerialMap = useRef(new Map());
  // Ref to keep track of last assigned serial number
  const lastAssignedSerial = useRef(0);

  const getSerialNumberForStudent = (studentId) => {
    if (studentSerialMap.current.has(studentId)) {
      return studentSerialMap.current.get(studentId);
    } else {
      lastAssignedSerial.current += 1;
      studentSerialMap.current.set(studentId, lastAssignedSerial.current);
      return lastAssignedSerial.current;
    }
  };

const formatStudentId = (studentId) => {
  const serialNumber = getSerialNumberForStudent(studentId);
  // Pad serial number with leading zeros to 4 digits
  const paddedSerial = serialNumber.toString().padStart(4, '0');
  return `STU${paddedSerial}`;
};

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentDetails();
      fetchFeeStructure();
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (selectedStudent && feeStructure) {
      // Fetch student fees only after fee structure is loaded
      fetchStudentFees();
    }
  }, [selectedStudent, feeStructure]);

  const fetchStudentDetails = async () => {
    if (!selectedStudent || !selectedStudent.id) return;
    setIsLoading(true);
    const result = await feesApi.getStudentDetails(selectedStudent.id, 'student');
    setIsLoading(false);
    if (result.success) {
      const student = result.data;
      setStudentDetails({
        phone: student.mobileNumber || 'N/A',
        email: student.email || 'N/A',
        address: `${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}` || 'N/A',
        dob: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A',
        fatherName: student.guardianName || 'N/A',
        motherName: 'N/A' // Not available in schema
      });
    } else {
      setAlert({ message: 'Failed to fetch student details', type: 'error' });
    }
  };

  const fetchFeeStructure = async () => {
    if (!selectedStudent || !selectedStudent.class) return;
    const course = selectedStudent.class.split(' ')[0]; // Extract course from class
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

  const fetchStudentFees = async () => {
    if (!selectedStudent || !selectedStudent.id) return;
    setIsLoading(true);
    const result = await feesApi.getStudentFees(selectedStudent.id);
    setIsLoading(false);
    if (result.success) {
      // Transform payment data to fee summary format
      const feeSummary = calculateFeeSummary(result.data);
      setFees(feeSummary);
    } else {
      setAlert({ message: 'Failed to fetch student fees', type: 'error' });
    }
  };

  const calculateFeeSummary = (payments) => {
    // Use actual fee structure if available, otherwise fallback to defaults
    let feeHeads = [];

    if (feeStructure && feeStructure.feeComponents) {
      // Convert feeComponents object to array format and round to 2 decimal places
      feeHeads = Object.entries(feeStructure.feeComponents).map(([key, value]) => ({
        head: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'), // Convert camelCase to Title Case
        total: Math.round((parseFloat(value) || 0) * 100) / 100 // Round to 2 decimals
      }));
    } else {
      // Fallback to default fee heads if fee structure not loaded
      feeHeads = [
        { head: 'Tuition Fee', total: 5000 },
        { head: 'Library Fee', total: 500 },
        { head: 'Sports Fee', total: 1000 },
        { head: 'Exam Fee', total: 1500 }
      ];
    }

    // Calculate total paid amount as float, rounded to 2 decimals
    const totalPaid = Math.round(payments.reduce((sum, payment) => {
      if (payment.status === 'Paid') {
        return sum + (parseFloat(payment.amount) || 0);
      }
      return sum;
    }, 0) * 100) / 100;

    // Allocate payments starting from first fee head, then next, etc.
    let remainingPaid = totalPaid;
    return feeHeads.map(fee => {
      const paidForThisFee = Math.min(remainingPaid, fee.total);
      remainingPaid -= paidForThisFee;
      return {
        head: fee.head,
        amount: fee.total,
        paid: Math.round(paidForThisFee * 100) / 100,
        balance: Math.round(Math.max(0, fee.total - paidForThisFee) * 100) / 100
      };
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const totalDue = fees.reduce((sum, fee) => sum + fee.balance, 0);
    const amount = parseFloat(paymentData.amount);

    if (amount <= 0 || amount > totalDue) {
      setAlert({ message: 'Invalid payment amount', type: 'error' });
      return;
    }

    if (!paymentData.paymentMode) {
      setAlert({ message: 'Please select payment mode', type: 'error' });
      return;
    }

    setIsLoading(true);

    if (!selectedStudent || !selectedStudent.id) {
      setAlert({ message: 'No student selected', type: 'error' });
      return;
    }

    const paymentPayload = {
      studentId: selectedStudent.id,
      course: selectedStudent.class.split(' ')[0], // Extract course from class
      year: parseInt(selectedStudent.class.split(' ')[1]) || 1, // Extract year
      semester: 1, // Default semester
      paymentType: 'year', // Default payment type
      paymentMethod: paymentData.paymentMode.toLowerCase(),
      remarks: paymentData.remarks || '',
      amount: amount,
      status: 'Paid', // Mark as paid immediately
      paymentDate: new Date().toISOString()
    };

    const result = await feesApi.collectFee(paymentPayload);
    setIsLoading(false);

    if (result.success) {
      // Generate receipt
      const receiptResult = await feesApi.generateReceipt(result.data.paymentId);
      if (receiptResult.success) {
        setReceipt({
          receiptNumber: receiptResult.data.receipt.receiptNumber,
          date: receiptResult.data.receipt.issuedDate,
          studentId: selectedStudent.id,
          studentName: selectedStudent.name,
          amount: amount,
          paymentMode: paymentData.paymentMode,
          remarks: paymentData.remarks || 'No remarks',
          paymentId: result.data.paymentId,
          breakdown: fees.filter(fee => fee.balance > 0).map(fee => ({
            head: fee.head,
            amount: Math.min(fee.balance, amount)
          }))
        });
        setAlert({ message: 'Payment collected successfully! Click "Generate Receipt" to view/print the receipt.', type: 'success' });
      } else {
        setAlert({ message: 'Payment collected but failed to generate receipt', type: 'warning' });
      }
      // Reset form
      setPaymentData({ amount: '', paymentMode: '', remarks: '' });
      // Refresh fees
      fetchStudentFees();
    } else {
      setAlert({ message: result.error, type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const totalDue = fees.reduce((sum, fee) => sum + fee.balance, 0);

  return (
    <div className="menu-content">
      <h1>Collect Fees</h1>

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="collect-fees-container">
        <div className="search-section">
          <StudentSearch
            onStudentSelect={setSelectedStudent}
            placeholder="Search student to collect fees..."
          />
        </div>

        {selectedStudent && (
          <>
            <div className="student-info">
              <h3>Student: {selectedStudent.name} ({formatStudentId(selectedStudent.id)})</h3>
              <p>Class: {selectedStudent.class} | Session: {selectedStudent.session}</p>
              {studentDetails && (
                <div className="additional-details">
                  <p><strong>Phone:</strong> {studentDetails.phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {studentDetails.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {studentDetails.address || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {studentDetails.dob || 'N/A'}</p>
                  <p><strong>Father's Name:</strong> {studentDetails.fatherName || 'N/A'}</p>
                  <p><strong>Mother's Name:</strong> {studentDetails.motherName || 'N/A'}</p>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="loading">Loading fee details...</div>
            ) : (
              <FeeSummaryTable fees={fees} />
            )}

            <div className="payment-section">
              {!showReceipt ? (
                <>
                  <h3>Payment Entry</h3>
                  <form onSubmit={handlePaymentSubmit} className="payment-form">
                    <div className="form-group">
                      <label>Amount to Pay (₹):</label>
                      <input
                        type="number"
                        name="amount"
                        value={paymentData.amount}
                        onChange={handleInputChange}
                        min="0"
                        max={totalDue}
                        step="0.01"
                        required
                      />
                      <small>Total due: ₹{totalDue.toLocaleString()}</small>
                    </div>

                    <div className="form-group">
                      <label>Payment Mode:</label>
                      <select
                        name="paymentMode"
                        value={paymentData.paymentMode}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select payment mode</option>
                        {paymentModes.map(mode => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Remarks (Optional):</label>
                      <textarea
                        name="remarks"
                        value={paymentData.remarks}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter any remarks..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isLoading || !paymentData.amount || !paymentData.paymentMode}
                    >
                      {isLoading ? 'Processing...' : 'Collect Fees'}
                    </button>
                  </form>

                  {receipt && (
                    <div className="receipt-preview">
                      <h3>Receipt Generated Successfully!</h3>
                      <div className="receipt-info">
                        <p><strong>Receipt No:</strong> {receipt.receiptNumber}</p>
                        <p><strong>Amount:</strong> ₹{receipt.amount.toLocaleString()}</p>
                        <p><strong>Payment Mode:</strong> {receipt.paymentMode}</p>
                        <p><strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}</p>
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowReceipt(true)}
                      >
                        Generate Receipt
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <ReceiptViewer
                  receipt={receipt}
                  onClose={() => setShowReceipt(false)}
                  onPrint={() => setAlert({ message: 'Receipt printed successfully!', type: 'success' })}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CollectFees;
