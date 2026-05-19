const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];


export const validateFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX`,
    };
  }

  return { isValid: true, error: null };
};


export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};


export const saveDoctorDocument = (doctorId, documentData) => {
  try {
    const documents = getDoctorDocuments(doctorId) || [];
    
    const newDocument = {
      id: Date.now(),
      fileName: documentData.fileName,
      fileType: documentData.fileType,
      fileSize: documentData.fileSize,
      fileData: documentData.fileData, 
      uploadDate: new Date().toISOString(),
      documentType: documentData.documentType, 
      description: documentData.description || '',
      verified: false, 
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


export const getDoctorDocuments = (doctorId) => {
  try {
    const documents = localStorage.getItem(`doctorDocuments_${doctorId}`);
    return documents ? JSON.parse(documents) : [];
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return [];
  }
};


export const getDoctorDocument = (doctorId, documentId) => {
  try {
    const documents = getDoctorDocuments(doctorId);
    return documents.find((doc) => doc.id === documentId);
  } catch (error) {
    console.error('Error retrieving document:', error);
    return null;
  }
};


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


export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};


export const getFileIcon = (fileType) => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word')) return '📝';
  return '📎';
};


export const downloadDocument = (document) => {
  try {
    const link = document.createElement('a');
    link.href = document.fileData; 
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading document:', error);
  }
};
