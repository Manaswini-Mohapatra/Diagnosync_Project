// src/utils/documentUploadHandler.js
/**
 * Utility functions for handling doctor document uploads
 * Handles file validation, storage, and retrieval
 */

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @returns {Object} - {isValid: boolean, error: string}
 */
export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Convert file to base64 for storage
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded file
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Save doctor document to localStorage
 * @param {string} doctorId - Doctor's user ID
 * @param {Object} documentData - Document information
 */
export const saveDoctorDocument = (doctorId, documentData) => {
  try {
    const documents = getDoctorDocuments(doctorId) || [];
    
    const newDocument = {
      id: Date.now(),
      fileName: documentData.fileName,
      fileType: documentData.fileType,
      fileSize: documentData.fileSize,
      fileData: documentData.fileData, // Base64
      uploadDate: new Date().toISOString(),
      documentType: documentData.documentType, // 'certificate', 'license', 'degree', etc.
      description: documentData.description || '',
      verified: false, // Admin will set this
    };

    documents.push(newDocument);
    localStorage.setItem(
      `doctorDocuments_${doctorId}`,
      JSON.stringify(documents)
    );

    return { success: true, documentId: newDocument.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all documents for a doctor
 * @param {string} doctorId - Doctor's user ID
 * @returns {Array} - Array of documents
 */
export const getDoctorDocuments = (doctorId) => {
  try {
    const documents = localStorage.getItem(`doctorDocuments_${doctorId}`);
    return documents ? JSON.parse(documents) : [];
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return [];
  }
};

/**
 * Get a specific document
 * @param {string} doctorId - Doctor's user ID
 * @param {number} documentId - Document ID
 * @returns {Object} - Document object
 */
export const getDoctorDocument = (doctorId, documentId) => {
  try {
    const documents = getDoctorDocuments(doctorId);
    return documents.find((doc) => doc.id === documentId);
  } catch (error) {
    console.error('Error retrieving document:', error);
    return null;
  }
};

/**
 * Delete a doctor document
 * @param {string} doctorId - Doctor's user ID
 * @param {number} documentId - Document ID to delete
 */
export const deleteDoctorDocument = (doctorId, documentId) => {
  try {
    let documents = getDoctorDocuments(doctorId);
    documents = documents.filter((doc) => doc.id !== documentId);
    localStorage.setItem(
      `doctorDocuments_${doctorId}`,
      JSON.stringify(documents)
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Update document verification status (admin function)
 * @param {string} doctorId - Doctor's user ID
 * @param {number} documentId - Document ID
 * @param {boolean} verified - Verification status
 */
export const verifyDoctorDocument = (doctorId, documentId, verified) => {
  try {
    let documents = getDoctorDocuments(doctorId);
    const docIndex = documents.findIndex((doc) => doc.id === documentId);
    
    if (docIndex !== -1) {
      documents[docIndex].verified = verified;
      documents[docIndex].verifiedDate = new Date().toISOString();
      localStorage.setItem(
        `doctorDocuments_${doctorId}`,
        JSON.stringify(documents)
      );
      return { success: true };
    }
    
    return { success: false, error: 'Document not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file icon based on type
 * @param {string} fileType - MIME type of file
 * @returns {string} - Icon representation
 */
export const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word')) return '📝';
  return '📎';
};

/**
 * Download document from localStorage
 * @param {Object} document - Document object
 */
export const downloadDocument = (document) => {
  try {
    const link = document.createElement('a');
    link.href = document.fileData; // This is base64
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};
