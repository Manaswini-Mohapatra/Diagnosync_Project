// src/utils/pdfGenerator.js
/**
 * Utility function to generate PDF from prescription data
 * Uses html2pdf library (lightweight, no backend needed)
 * Includes DiagnoSync logo with gradient text
 */

export const downloadPrescriptionPDF = (prescription) => {
  // Create HTML content for PDF with Logo
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Prescription - ${prescription.medicationName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f5f5;
          padding: 20px;
        }
        
        .container {
          max-width: 700px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #0066FF;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        
        .logo-img {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }
        
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          color: #0066FF;
          margin: 0;
          letter-spacing: 0.5px;
        }
        
        .logo-text-green {
          color: #00B341;
        }
        
        .subtitle {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        
        .prescription-number {
          font-size: 11px;
          color: #999;
          font-style: italic;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        
        .medication-section {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          border-left: 4px solid #0066FF;
        }
        
        .medication-name {
          font-size: 22px;
          font-weight: bold;
          color: #0066FF;
          margin-bottom: 8px;
        }
        
        .medication-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
        }
        
        .badge-primary {
          background-color: #e3f2fd;
          color: #0066FF;
        }
        
        .badge-success {
          background-color: #e8f5e9;
          color: #00B341;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .detail-item {
          padding: 12px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .detail-label {
          font-size: 11px;
          font-weight: bold;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        
        .detail-value {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }
        
        .notes-box {
          background-color: #fff3cd;
          border-left: 4px solid #FFB700;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .notes-label {
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .notes-text {
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #999;
          font-size: 11px;
          line-height: 1.6;
        }
        
        .footer-text {
          margin: 5px 0;
        }
        
        .timestamp {
          color: #aaa;
          font-size: 10px;
          margin-top: 10px;
        }
        
        @media print {
          body {
            padding: 0;
            background-color: white;
          }
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo -->
        <div class="header">
          <div class="logo-section">
            <img 
              src="/diagnosync_icon_transparent.svg" 
              alt="DiagnoSync Logo" 
              class="logo-img"
            />
            <div>
              <div class="logo-text">
                <span style="color: #0066FF;">Diagno</span><span style="color: #00B341;">sync</span>
              </div>
            </div>
          </div>
          <div class="subtitle">Patient Prescription Portal</div>
          <div class="prescription-number">Prescription #${prescription.prescriptionNumber}</div>
        </div>
        
        <!-- Medication Section -->
        <div class="medication-section">
          <div class="medication-name">${prescription.medicationName}</div>
          <div class="medication-meta">
            <span class="badge badge-primary">${prescription.strength}</span>
            <span class="badge badge-success">Active</span>
          </div>
        </div>
        
        <!-- Medication Details -->
        <div class="section">
          <div class="section-title">Medication Details</div>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Form</div>
              <div class="detail-value">${prescription.form}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Frequency</div>
              <div class="detail-value">${prescription.frequency}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Quantity</div>
              <div class="detail-value">${prescription.quantity}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Pharmacy</div>
              <div class="detail-value">${prescription.pharmacy}</div>
            </div>
          </div>
        </div>
        
        <!-- Medical Information -->
        <div class="section">
          <div class="section-title">Medical Information</div>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Indication</div>
              <div class="detail-value">${prescription.indication}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Prescribed By</div>
              <div class="detail-value">${prescription.doctor}</div>
            </div>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="section">
          <div class="section-title">Instructions</div>
          <div class="detail-item">
            <div class="detail-value">${prescription.instructions}</div>
          </div>
        </div>
        
        <!-- Prescription Dates -->
        <div class="section">
          <div class="section-title">Prescription Information</div>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">Prescribed Date</div>
              <div class="detail-value">${formatDateForDisplay(prescription.prescribedDate)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Expiry Date</div>
              <div class="detail-value">${formatDateForDisplay(prescription.expiryDate)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Refills Remaining</div>
              <div class="detail-value">${prescription.refillsRemaining > 0 ? prescription.refillsRemaining : 'No refills'}</div>
            </div>
          </div>
        </div>
        
        <!-- Notes -->
        ${prescription.notes ? `
          <div class="notes-box">
            <div class="notes-label">⚠️ Important Notes:</div>
            <div class="notes-text">${prescription.notes}</div>
          </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">This prescription was generated from DiagnoSync Patient Portal</div>
          <div class="footer-text">Please consult your healthcare provider for any questions</div>
          <div class="footer-text">For urgent medical concerns, please contact emergency services</div>
          <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create blob from HTML
  const element = document.createElement('div');
  element.innerHTML = htmlContent;

  // Use html2pdf library if available, otherwise use print fallback
  if (window.html2pdf) {
    const options = {
      margin: 10,
      filename: `prescription_${prescription.medicationName}_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    window.html2pdf().set(options).from(element).save();
  } else {
    // Fallback: Open in new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};

// Helper function to format dates
const formatDateForDisplay = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
