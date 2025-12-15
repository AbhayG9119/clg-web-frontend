import React from 'react';
import '../../styles/ReceiptViewer.css';

const ReceiptViewer = ({ receipt, onClose, onPrint }) => {
  if (!receipt) return null;

  return (
    <div className="receipt-viewer-overlay">
      <div className="receipt-viewer">
        <div className="receipt-header">
          <h2>College Fee Receipt</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="receipt-content">
          <div className="receipt-details">
            <div className="detail-row">
              <span className="label">Receipt Number:</span>
              <span className="value">{receipt.receiptNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Date:</span>
              <span className="value">{new Date(receipt.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Student ID:</span>
              <span className="value">{receipt.studentId}</span>
            </div>
            <div className="detail-row">
              <span className="label">Student Name:</span>
              <span className="value">{receipt.studentName}</span>
            </div>
            <div className="detail-row">
              <span className="label">Payment Mode:</span>
              <span className="value">{receipt.paymentMode}</span>
            </div>
            <div className="detail-row">
              <span className="label">Amount Paid:</span>
              <span className="value">₹{receipt.amount.toLocaleString()}</span>
            </div>
            {receipt.remarks && (
              <div className="detail-row">
                <span className="label">Remarks:</span>
                <span className="value">{receipt.remarks}</span>
              </div>
            )}
          </div>

          {receipt.breakdown && receipt.breakdown.length > 0 && (
            <div className="fee-breakdown">
              <h3>Fee Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Fee Head</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.breakdown.map((item, index) => (
                    <tr key={index}>
                      <td>{item.head}</td>
                      <td>₹{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td><strong>Total</strong></td>
                    <td><strong>₹{receipt.amount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="receipt-footer">
          <p>This is a computer generated receipt.</p>
          <div className="receipt-actions">
            <button className="btn btn-secondary" onClick={onPrint}>
              Print Receipt
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;
