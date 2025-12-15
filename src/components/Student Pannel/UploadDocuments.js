import React, { useState } from 'react';
import '../../styles/UploadDocuments.css';

const UploadDocuments = () => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploading, setUploading] = useState(false);

  const documentTypes = [
    '10th (High School) Marksheet',
    '12th (Intermediate) Marksheet',
    'Transfer Certificate (TC) from last institute',
    'Character Certificate',
    'Caste Certificate',
    'Domicile Certificate',
    'Recent passport size photographs',
    'Aadhaar Card or any valid Identity Proof'
  ];

  const handleFileChange = (event, docType) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [docType]: file
      }));
    }
  };

  const handleUpload = async (docType) => {
    const file = uploadedFiles[docType];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', docType);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${docType} uploaded successfully!`);
        setUploadedFiles(prev => ({
          ...prev,
          [docType]: null
        }));
        // Clear the file input
        const fileInput = document.querySelector(`input[type="file"][data-doctype="${docType}"]`);
        if (fileInput) fileInput.value = '';
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${errorData.message || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-documents">
      <h2>Upload Documents</h2>
      <form>
        {documentTypes.map(docType => (
          <div key={docType} className="document-upload">
            <label>{docType}:</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              data-doctype={docType}
              onChange={(e) => handleFileChange(e, docType)}
            />
            {uploadedFiles[docType] && (
              <div>
                <span>Selected: {uploadedFiles[docType].name}</span>
                <button
                  type="button"
                  onClick={() => handleUpload(docType)}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </div>
        ))}
      </form>
    </div>
  );
};

export default UploadDocuments;
