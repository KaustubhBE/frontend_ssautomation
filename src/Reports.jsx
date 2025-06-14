import React, { useState, useCallback, useEffect } from 'react';
import './Reports.css';
import { getApiUrl } from './config';

const Reports = () => {
  const [templateFiles, setTemplateFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState({});
  const [isDraggingTemplate, setIsDraggingTemplate] = useState(false);
  const [isDraggingAttachment, setIsDraggingAttachment] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [sheetError, setSheetError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAttachmentDropdown, setShowAttachmentDropdown] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [mailSubject, setMailSubject] = useState('');

  const handleDragEnter = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'template') {
      setIsDraggingTemplate(true);
    } else {
      setIsDraggingAttachment(true);
    }
  }, []);

  const handleDragLeave = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'template') {
      setIsDraggingTemplate(false);
    } else {
      setIsDraggingAttachment(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === 'template') {
      setIsDraggingTemplate(false);
    } else {
      setIsDraggingAttachment(false);
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const fileType = file.type;
      const isValidType = 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      
      if (!isValidType) {
        alert(`File type not supported: ${file.name}. Please upload only .docx`);
      }
      return isValidType;
    });

    if (type === 'template') {
      if (validFiles.length > 1) {
        alert('Only one template file can be uploaded');
        return;
      }
      setTemplateFiles(validFiles);
    } else {
      setAttachmentFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        let maxKey = Object.keys(newFiles).length > 0 ? Math.max(...Object.keys(newFiles).map(Number)) : 0;
        validFiles.forEach(file => {
          maxKey += 1;
          newFiles[maxKey] = file;
        });
        return newFiles;
      });
    }
  }, []);

  const handleFileInput = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => {
      const fileType = file.type;
      const isValidType = 
        fileType === 'text/plain' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileType === 'image/png' ||
        fileType === 'image/jpeg' ||
        fileType === 'image/jpg' ||
        fileType === 'application/pdf';
      
      if (!isValidType) {
        alert(`File type not supported: ${file.name}. Please upload only .txt, .docx, .png, .jpg, .jpeg, or .pdf files.`);
      }
      return isValidType;
    });

    if (type === 'template') {
      if (validFiles.length > 1) {
        alert('Only one template file can be uploaded');
        return;
      }
      setTemplateFiles(validFiles);
      if (validFiles.length > 0) {
        handleFilePreview(validFiles[0], 'template');
      }
    } else {
      setAttachmentFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        let maxKey = Object.keys(newFiles).length > 0 ? Math.max(...Object.keys(newFiles).map(Number)) : 0;
        validFiles.forEach(file => {
          maxKey += 1;
          newFiles[maxKey] = file;
        });
        return newFiles;
      });
      if (validFiles.length > 0) {
        handleFilePreview(validFiles[0], 'attachment');
      }
    }
  };

  const handleRemoveFile = (index, type) => {
    if (type === 'template') {
      setTemplateFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    } else {
      setAttachmentFiles(prevFiles => {
        const newFiles = { ...prevFiles };
        delete newFiles[index + 1]; // index+1 because keys are 1-based
        // Re-sequence keys
        const filesArr = Object.values(newFiles);
        const resequenced = {};
        filesArr.forEach((file, i) => {
          resequenced[i + 1] = file;
        });
        return resequenced;
      });
    }
  };

  const validateSheetId = (id) => {
    // Google Sheet ID is typically 20-100 characters long
    const sheetIdRegex = /^[a-zA-Z0-9-_]{44}$/;
    return sheetIdRegex.test(id);
  };

  const extractSheetId = (url) => {
    try {
      // Handle different Google20,100heets URL formats
      let sheetId = url;
      
      // If it's a complete URL
      if (url.includes('docs.google.com')) {
        // Extract ID from URL patterns like:
        // https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
        // https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=0
        const match = url.match(/\/d\/([a-zA-Z0-9-_]{44})/);
        if (match && match[1]) {
          sheetId = match[1];
        }
      }
      
      return sheetId;
    } catch (error) {
      console.error('Error extracting sheet ID:', error);
      return url; // Return original input if extraction fails
    }
  };

  const handleSheetIdChange = (e) => {
    const value = e.target.value.trim();
    const extractedId = extractSheetId(value);
    setSheetId(extractedId);
    
    if (extractedId && !validateSheetId(extractedId)) {
      setSheetError('Invalid Google Sheet ID format');
    } else {
      setSheetError('');
    }
  };

  const handleSheetNameChange = (e) => {
    setSheetName(e.target.value.trim());
  };

  const handleCopyServiceAccount = () => {
    const serviceAccountId = "ems-974@be-ss-automation-445106.iam.gserviceaccount.com";
    navigator.clipboard.writeText(serviceAccountId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleFilePreview = async (file, type) => {
    try {
      if (type === 'attachment') {
        // For attachments, show all filenames in order
        const items = Object.entries(attachmentFiles).map(([key, file]) => ({
          id: Number(key),
          content: `[${file.name}]`,
          type: 'attachment'
        }));
        setPreviewItems(items);
        setPreviewTitle('Attachment Preview');
        return;
      }

      // For template files, get the content
      const formData = new FormData();
      formData.append('file', file);

      const apiUrl = getApiUrl('preview-file');
      console.log('Sending preview request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to preview file' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.content) {
        throw new Error('No content received from server');
      }

      // Format the template content with proper line breaks
      let templateContent = data.content.split('\n').map(line => line.trim()).join('\n');
      
      // Create items array with template content
      const items = [
        { id: 1, content: templateContent, type: 'template', file: file }
      ];

      // Add attachment items
      if (Object.keys(attachmentFiles).length > 0) {
        Object.entries(attachmentFiles).forEach(([key, file]) => {
          items.push({
            id: Number(key) + 1, // Start from 2 since template is 1
            content: `[${file.name}]`,
            type: 'attachment',
            file: file
          });
        });
      }

      setPreviewItems(items);
      setPreviewTitle('Content Preview');
    } catch (error) {
      console.error('Error previewing file:', error);
      setPreviewItems([{ id: Date.now(), content: `Error previewing file: ${error.message}`, type: 'error' }]);
      setPreviewTitle('Preview Error');
    }
  };

  const handlePreviewDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePreviewDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePreviewDrop = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const newItems = [...previewItems];
    const draggedContent = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedContent);
    
    // Update IDs to maintain sequence
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      id: idx + 1
    }));
    
    setPreviewItems(updatedItems);
    setDraggedItem(null);

    // If attachments are being reordered, update attachmentFiles object
    const attachmentItems = updatedItems.filter(item => item.type === 'attachment');
    if (attachmentItems.length > 0) {
      const resequenced = {};
      attachmentItems.forEach((item, i) => {
        resequenced[i + 1] = item.file;
      });
      setAttachmentFiles(resequenced);
    }
  };

  // Add a new function to update preview when files change
  const updatePreview = useCallback(() => {
    if (templateFiles.length > 0) {
      handleFilePreview(templateFiles[0], 'template');
    } else if (Object.keys(attachmentFiles).length > 0) {
      handleFilePreview(Object.values(attachmentFiles)[0], 'attachment');
    } else {
      setPreviewItems([]);
      setPreviewTitle('Preview');
    }
  }, [templateFiles, attachmentFiles]);

  // Update preview whenever files change
  useEffect(() => {
    updatePreview();
  }, [templateFiles, attachmentFiles, updatePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (templateFiles.length === 0) {
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

    if (!sheetName) {
      alert('Please enter the sheet name');
      return;
    }

    if (!sendWhatsapp && !sendEmail) {
      alert('Please select at least one notification method (WhatsApp or Email)');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Sort all items by their sequence number
      const sortedItems = [...previewItems].sort((a, b) => a.id - b.id);
      
      // Add files in sequence order
      sortedItems.forEach(item => {
        if (item.type === 'template') {
          formData.append('template_files', item.file);
        } else if (item.type === 'attachment') {
          formData.append('attachment_files', item.file);
        }
      });

      // Add other required data
      formData.append('sheet_id', sheetId);
      formData.append('sheet_name', sheetName);
      formData.append('send_whatsapp', sendWhatsapp);
      formData.append('send_email', sendEmail);
      formData.append('mail_subject', mailSubject);

      // Add file sequencing information as a JSON string
      formData.append('file_sequence', JSON.stringify(sortedItems));

      // Send request to backend
      const response = await fetch(getApiUrl('send-reports'), {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header when sending FormData
          // The browser will automatically set it with the correct boundary
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate reports');
      }

      const result = await response.json();
      
      // Show success message
      alert(result.message || 'Reports generated and sent successfully!');
      
      // Reset form
      setTemplateFiles([]);
      setAttachmentFiles({});
      setSheetId('');
      setSheetName('');
      setSendWhatsapp(false);
      setSendEmail(false);
      setMailSubject('');
      setPreviewItems([]);
      
      // Refresh the page after successful submission
      window.location.reload();
      
    } catch (error) {
      console.error('Error generating reports:', error);
      alert(error.message || 'Failed to generate reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <h1>Generate Reports</h1>
      
      {/* Email Subject at the top, full width */}
      <div className="full-width-input-group">
        <label htmlFor="mail-subject">Email Subject</label>
        <input
          type="text"
          id="mail-subject"
          value={mailSubject}
          onChange={e => setMailSubject(e.target.value)}
          placeholder="Enter Email Subject"
          className="full-width-input"
        />
      </div>

      <div className="drop-zones-container">
        <div 
          className={`drop-zone ${isDraggingTemplate ? 'dragging' : ''}`}
          onDragEnter={(e) => handleDragEnter(e, 'template')}
          onDragLeave={(e) => handleDragLeave(e, 'template')}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'template')}
        >
          <div className="drop-zone-content-template">
            <h3>Template Files</h3>
            <p>Drag and drop template files here</p>
            <p className="file-types">Supported formats: .docx</p>
            <div className="file-input-container">
              <input
                type="file"
                id="template-file-input"
                onChange={(e) => handleFileInput(e, 'template')}
                accept=".docx"
                style={{ display: 'none' }}
              />
              <button 
                className="browse-button"
                onClick={() => {
                  document.getElementById('template-file-input').click();
                  setShowTemplateDropdown(!showTemplateDropdown);
                }}
              >
                Browse Template Files
              </button>
              {showTemplateDropdown && (
                <div className="files-dropdown">
                  {templateFiles.length > 0 ? (
                    templateFiles.map((file, index) => (
                      <div key={`template-${index}`} className="file-item">
                        <span className="file-name" title={file.name}>
                          {file.name}
                        </span>
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveFile(index, 'template')}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-files">No files selected</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className={`drop-zone ${isDraggingAttachment ? 'dragging' : ''}`}
          onDragEnter={(e) => handleDragEnter(e, 'attachment')}
          onDragLeave={(e) => handleDragLeave(e, 'attachment')}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'attachment')}
        >
          <div className="drop-zone-content-attachment">
            <h3>Attachment Files</h3>
            <p>Drag and drop files to be attached here</p>
            <p className="file-types">Supported formats: .txt, .docx, .png, .jpg, .jpeg, .pdf</p>
            <div className="file-input-container">
              <input
                type="file"
                id="attachment-file-input"
                multiple
                onChange={(e) => handleFileInput(e, 'attachment')}
                accept=".txt,.docx,.png,.jpg,.jpeg,.pdf"
                style={{ display: 'none' }}
              />
              <button 
                className="browse-button"
                onClick={() => {
                  document.getElementById('attachment-file-input').click();
                  setShowAttachmentDropdown(!showAttachmentDropdown);
                }}
              >
                Browse Attachment Files
              </button>
              {showAttachmentDropdown && (
                <div className="files-dropdown">
                  {Object.entries(attachmentFiles).length > 0 ? (
                    Object.entries(attachmentFiles).map(([key, file], index) => (
                      <div key={`attachment-${key}`} className="file-item">
                        <span className="file-name" title={file.name}>
                          {file.name}
                        </span>
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveFile(index, 'attachment')}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-files">No files selected</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Preview Section */}
      <div className="preview-section">
        <div className="preview-container">
          {/* Template Preview */}
          <div className="preview-content-section">
            <h3>Template Preview</h3>
            <div className="preview-content">
              {templateFiles.length > 0 && previewItems.length > 0 ? (
                <div 
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '20px',
                    height: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {previewItems
                    .filter(item => item.type === 'template')
                    .map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '10px',
                          margin: '5px 0',
                          backgroundColor: 'white',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px'
                        }}
                      >
                        <pre style={{ 
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          fontFamily: 'Arial, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {item.content}
                        </pre>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="preview-placeholder">
                  <h4>Template Information</h4>
                  <p>Template files should contain placeholders that will be replaced with data from the Google Sheet.</p>
                  <div className="template-example">
                    <p>Example:</p>
                    <pre>Dear {'{name}'},</pre>
                    <pre>Your report is ready. Please find your details below:</pre>
                  </div>
                  <p className="preview-hint">Upload a template file to see its content</p>
                </div>
              )}
            </div>
          </div>

          {/* Content Sequencing */}
          <div className="sequencing-section">
            <h3>Content Sequencing</h3>
            <div className="sequencing-content">
              {previewItems.length > 0 ? (
                <div 
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '20px',
                    height: '300px',
                    overflowY: 'auto'
                  }}
                >
                  {previewItems.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handlePreviewDragStart(e, index)}
                      onDragOver={(e) => handlePreviewDragOver(e, index)}
                      onDrop={(e) => handlePreviewDrop(e, index)}
                      style={{
                        cursor: 'move',
                        padding: '10px',
                        margin: '5px 0',
                        backgroundColor: draggedItem === index ? '#e9ecef' : 'white',
                        border: '1px dashed #dee2e6',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ 
                        marginRight: '10px',
                        color: '#6c757d',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {item.id}.
                      </div>
                      <div style={{
                        flex: 1,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '14px',
                        color: item.type === 'attachment' ? '#0d6efd' : '#212529'
                      }}>
                        {item.type === 'attachment' ? item.content : 'Template Content'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sequencing-placeholder">
                  <p>Upload files to start sequencing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sheet-id-section">
        <div className="sheet-inputs">
          <div className="sheet-input-group">
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
          </div>
          
          <div className="sheet-input-group">
            <label htmlFor="sheet-name">Sheet Name</label>
            <input
              type="text"
              id="sheet-name"
              value={sheetName}
              onChange={handleSheetNameChange}
              placeholder="Enter Sheet Name"
            />
          </div>
        </div>

        <div className="service-account-section">
          <label>Service Account ID</label>
          <div className="service-account-container">
            <input
              type="text"
              value="ems-974@be-ss-automation-445106.iam.gserviceaccount.com"
              readOnly
              className="service-account-input"
            />
            <button 
              className={`copy-button ${copySuccess ? 'success' : ''}`}
              onClick={handleCopyServiceAccount}
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p>Share the sheet with the service account email address</p>
        </div>
        <div className="sheet-headers-info">
              <h4>Required Google Sheet Headers:</h4>
              <div className="headers-container">
                <div className="header-item">
                  <span className="header-label">Name</span>
                </div>
                <div className="header-item">
                  <span className="header-label">Country Code</span>
                </div>
                <div className="header-item">
                  <span className="header-label">Contact No.</span>
                </div>
                <div className="header-item">
                  <span className="header-label">Email ID - To</span>
                </div>
                <button 
                  className="copy-all-headers-button"
                  onClick={() => {
                    const headers = ['Name', 'Country Code', 'Contact No.', 'Email ID'];
                    navigator.clipboard.writeText(headers.join('\t'));
                    alert('Headers copied to clipboard! Paste them in the first row of your Google Sheet');
                  }}
                >
                  Copy All Headers
                </button>
              </div>
              <p className="headers-note">Click "Copy All Headers" and paste them in the first row of your Google Sheet</p>
            </div>

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
        disabled={templateFiles.length === 0 || !sheetId || !!sheetError || isLoading || (!sendWhatsapp && !sendEmail)}
      >
        {isLoading ? 'Generating Reports...' : 'Generate Reports'}
      </button>
    </div>
  );
};

export default Reports;
