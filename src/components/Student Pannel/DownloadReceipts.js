import React, { useState, useEffect } from 'react';

const DownloadReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyReceipts();
  }, []);

  const fetchMyReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/receipts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReceipts(data);
      } else {
        setMessage('Failed to fetch receipts');
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setMessage('Error fetching receipts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (receiptId, receiptNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${receiptNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setMessage('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setMessage('Error downloading receipt: ' + error.message);
    }
  };

  return (
    <div className="menu-content">
      <h1>Download Fee Receipts</h1>
      <p>Download your fee payment receipts here.</p>

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

      {loading ? (
        <p>Loading receipts...</p>
      ) : receipts.length > 0 ? (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Receipt No</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Student Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(receipt => (
                <tr key={receipt._id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {receipt.receiptNumber}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {receipt.studentName}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    ₹{receipt.amount}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: receipt.status === 'Active' ? '#d4edda' : '#f8d7da',
                      color: receipt.status === 'Active' ? '#155724' : '#721c24'
                    }}>
                      {receipt.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {new Date(receipt.issuedDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    <button
                      onClick={() => downloadReceipt(receipt._id, receipt.receiptNumber)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No receipts available.</p>
      )}
    </div>
  );
};

export default DownloadReceipts;
