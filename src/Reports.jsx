import React, { useState, useCallback } from 'react';
import './Reports.css';

const Reports = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [sheetError, setSheetError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const fileType = file.type;
      const isValidType = 
        fileType === 'text/plain' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isValidType) {
        alert(`File type not supported: ${file.name}. Please upload only .txt or .docx files.`);
      }
      return isValidType;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type;
      const isValidType = 
        fileType === 'text/plain' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isValidType) {
        alert(`File type not supported: ${file.name}. Please upload only .txt or .docx files.`);
      }
      return isValidType;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const validateSheetId = (id) => {
    // Google Sheet ID is typically 44 characters long
    const sheetIdRegex = /^[a-zA-Z0-9-_]{44}$/;
    return sheetIdRegex.test(id);
  };

  const handleSheetIdChange = (e) => {
    const value = e.target.value.trim();
    setSheetId(value);
    
    if (value && !validateSheetId(value)) {
      setSheetError('Invalid Google Sheet ID format');
    } else {
      setSheetError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert('Please add at least one template file');
      return;
    }

    if (!sheetId) {
      setSheetError('Google Sheet ID is required');
      return;
    }

    if (!validateSheetId(sheetId)) {
      setSheetError('Invalid Google Sheet ID format');
      return;
    }

    if (!sendWhatsapp && !sendEmail) {
      alert('Please select at least one notification method (WhatsApp or Email)');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('sheet_id', sheetId);
    formData.append('send_whatsapp', sendWhatsapp);
    formData.append('send_email', sendEmail);

    try {
      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/upload-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      alert('Reports generated and sent successfully!');
      setFiles([]);
      setSheetId('');
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Failed to generate reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <h1>Generate Reports</h1>
      
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="drop-zone-content">
          <p>Drag and drop template files here</p>
          <p className="file-types">Supported formats: .txt, .docx</p>
          <p className="template-info">
            Template files should contain placeholders that will be replaced with data from the Google Sheet.
            <br />
            Example: "Dear {name}, your report is ready..."
          </p>
          <input
            type="file"
            id="file-input"
            multiple
            onChange={handleFileInput}
            accept=".txt,.docx"
            style={{ display: 'none' }}
          />
          <button 
            className="browse-button"
            onClick={() => document.getElementById('file-input').click()}
          >
            Browse Template Files
          </button>
        </div>
      </div>

      <div className="files-list">
        {files.map((file, index) => (
          <div key={index} className="file-item">
            <span className="file-name">{file.name}</span>
            <button 
              className="remove-button"
              onClick={() => handleRemoveFile(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="sheet-id-section">
        <label htmlFor="sheet-id">Google Sheet ID</label>
        <input
          type="text"
          id="sheet-id"
          value={sheetId}
          onChange={handleSheetIdChange}
          placeholder="Enter Google Sheet ID"
          className={sheetError ? 'error' : ''}
        />
        {sheetError && <span className="error-message">{sheetError}</span>}
        <p className="help-text">
          The sheet should contain recipient details (name, contact, email, etc.) that will be replaced in the template files.
        </p>
      </div>

      <div className="notification-section">
        <h2>Notification Methods</h2>
        <div className="toggle-container">
          <div className="toggle-item">
            <label className="toggle">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Send via Email</span>
          </div>
          <div className="toggle-item">
            <label className="toggle">
              <input
                type="checkbox"
                checked={sendWhatsapp}
                onChange={(e) => setSendWhatsapp(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">Send via WhatsApp</span>
          </div>
        </div>
      </div>

      <button 
        className="submit-button"
        onClick={handleSubmit}
        disabled={files.length === 0 || !sheetId || !!sheetError || isLoading || (!sendWhatsapp && !sendEmail)}
      >
        {isLoading ? 'Generating Reports...' : 'Generate Reports'}
      </button>
    </div>
  );
};

export default Reports;
