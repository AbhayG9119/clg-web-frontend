import React, { useState, useEffect } from 'react';
import '../../styles/ViewDocuments.css';

const ViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      } else {
        alert('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/documents/download/${encodeURIComponent(documentType)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentType;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="view-documents">
      <h2>View Documents</h2>
      {documents.length === 0 ? (
        <p>No documents found. Please upload your documents first.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Status</th>
              <th>Uploaded Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => (
              <tr key={index}>
                <td>{doc.type}</td>
                <td>{doc.status}</td>
                <td>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {doc.fileName ? (
                    <button onClick={() => handleDownload(doc.type)}>Download</button>
                  ) : (
                    <span>Not Uploaded</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewDocuments;
