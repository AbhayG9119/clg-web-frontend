import React, { useState, useEffect } from 'react';

const StaffVerifyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/staff/documents/course', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDocuments(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (studentId, docType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/documents/verify', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          documentType: docType,
          status: 'Verified'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);

      // Update local state
      setDocuments(prevDocuments =>
        prevDocuments.map(student =>
          student.studentId === studentId
            ? {
                ...student,
                documents: student.documents.map(doc =>
                  doc.type === docType ? { ...doc, status: 'Verified' } : doc
                )
              }
            : student
        )
      );
    } catch (err) {
      alert(`Error verifying document: ${err.message}`);
    }
  };

  const handleReject = async (studentId, docType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/documents/verify', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          documentType: docType,
          status: 'Rejected'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);

      // Update local state
      setDocuments(prevDocuments =>
        prevDocuments.map(student =>
          student.studentId === studentId
            ? {
                ...student,
                documents: student.documents.map(doc =>
                  doc.type === docType ? { ...doc, status: 'Rejected' } : doc
                )
              }
            : student
        )
      );
    } catch (err) {
      alert(`Error rejecting document: ${err.message}`);
    }
  };

  const handleDownload = async (studentId, docType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/documents/download/${studentId}/${encodeURIComponent(docType)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`; // Default to PDF, adjust as needed
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Error downloading document: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="verify-documents"><p>Loading documents...</p></div>;
  }

  if (error) {
    return <div className="verify-documents"><p>Error: {error}</p></div>;
  }

  return (
    <div className="verify-documents">
      <h2>Verify Student Documents</h2>
      {documents.length === 0 ? (
        <p>No documents pending verification.</p>
      ) : (
        documents.map(student => (
          <div key={student.studentId} className="student-documents">
            <h3>{student.studentName} (ID: {student.studentId})</h3>
            <table>
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {student.documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.type}</td>
                    <td>{doc.status}</td>
                    <td>
                      {doc.fileName && <button onClick={() => handleDownload(student.studentId, doc.type)}>View</button>}
                      {doc.status === 'Pending' && (
                        <>
                          <button onClick={() => handleVerify(student.studentId, doc.type)}>Verify</button>
                          <button onClick={() => handleReject(student.studentId, doc.type)}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default StaffVerifyDocuments;
