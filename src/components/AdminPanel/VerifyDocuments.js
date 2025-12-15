import React, { useState } from 'react';

const VerifyDocuments = () => {
  // Mock data for demonstration. In a real app, this would come from the server.
  const [documents, setDocuments] = useState([
    {
      studentId: 'STU001',
      studentName: 'John Doe',
      documents: [
        { type: '12th (Intermediate) Marksheet', status: 'Pending', fileName: '12th_marksheet.pdf' },
        { type: 'Character Certificate', status: 'Pending', fileName: 'character_certificate.pdf' },
        { type: 'Domicile Certificate', status: 'Pending', fileName: 'domicile_certificate.pdf' },
        { type: 'Recent passport size photographs', status: 'Pending', fileName: 'passport_photo.jpg' },
        { type: 'Aadhaar Card or any valid Identity Proof', status: 'Pending', fileName: 'aadhaar.pdf' }
      ]
    },
    {
      studentId: 'STU003',
      studentName: 'Alice Johnson',
      documents: [
        { type: '10th (High School) Marksheet', status: 'Pending', fileName: '10th_marksheet.pdf' },
        { type: 'Caste Certificate', status: 'Pending', fileName: 'caste_certificate.pdf' }
      ]
    }
  ]);

  const handleVerify = (studentId, docType) => {
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
    alert(`Document "${docType}" for student ${studentId} has been verified.`);
  };

  const handleReject = (studentId, docType) => {
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
    alert(`Document "${docType}" for student ${studentId} has been rejected.`);
  };

  const handleDownload = (fileName) => {
    // In a real app, this would trigger a download from the server
    alert(`Downloading ${fileName}`);
  };

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
                      <button onClick={() => handleDownload(doc.fileName)}>View</button>
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

export default VerifyDocuments;
