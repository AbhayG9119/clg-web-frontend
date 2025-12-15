import React, { useState, useEffect } from 'react';
import '../../styles/ViewDocuments.css';

const StaffViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffCourse, setStaffCourse] = useState(''); // Will be set from API response

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/documents/course', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.students);
        // Set course from first student if available
        if (data.students.length > 0) {
          setStaffCourse(data.students[0].course);
        }
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

  const handleDownload = async (studentId, documentType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/staff/documents/download/${studentId}/${encodeURIComponent(documentType)}`, {
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
      <h2>View Student Documents ({staffCourse})</h2>
      {documents.map(student => (
        <div key={student.studentId} className="student-documents">
          <h3>{student.studentName} (ID: {student.studentId}) - Course: {student.course}</h3>
          <table>
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {student.documents.map((doc, index) => (
                <tr key={index}>
                  <td>{doc.type}</td>
                  <td>{doc.status}</td>
                  <td>
                    {doc.fileName ? (
                      <button onClick={() => handleDownload(student.studentId, doc.type)}>Download</button>
                    ) : (
                      <span>Not Uploaded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default StaffViewDocuments;
