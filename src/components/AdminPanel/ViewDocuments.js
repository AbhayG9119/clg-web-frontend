import React, { useState, useEffect } from 'react';
import '../../styles/ViewDocuments.css';

const ViewDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const courses = ['B.A', 'B.Sc', 'B.Ed'];

  useEffect(() => {
    fetchDocuments();
  }, [selectedCourse]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedCourse
        ? `/api/users/documents?course=${encodeURIComponent(selectedCourse)}`
        : '/api/users/documents';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.students);
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
      const response = await fetch(`/api/users/documents/download/${studentId}/${encodeURIComponent(documentType)}`, {
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
      <h2>View All Student Documents</h2>
      <div className="course-filter">
        <label htmlFor="course-select">Select Course: </label>
        <select
          id="course-select"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>
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

export default ViewDocuments;
