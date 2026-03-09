// src/utils/appointmentPdfGenerator.js
/**
 * Utility function to generate appointment confirmation PDF
 * Creates a professional appointment confirmation document
 */

export const downloadAppointmentConfirmation = (appointmentData) => {
  const { doctorName, specialty, date, time, appointmentType, reason, fee } = appointmentData;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Appointment Confirmation - ${doctorName}</title>
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
          margin-bottom: 15px;
        }
        
        .logo-img {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }
        
        .logo-text {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
          letter-spacing: 0.5px;
        }
        
        .subtitle {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .confirmation-number {
          font-size: 11px;
          color: #999;
          font-style: italic;
          margin-top: 5px;
        }
        
        .success-badge {
          display: inline-block;
          background-color: #e8f5e9;
          color: #00B341;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
          margin-top: 10px;
          text-transform: uppercase;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        
        .appointment-details {
          background-color: #f0f4ff;
          padding: 25px;
          border-radius: 8px;
          border-left: 4px solid #0066FF;
          margin-bottom: 20px;
        }
        
        .detail-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 20px;
          margin-bottom: 15px;
          align-items: start;
        }
        
        .detail-label {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
        }
        
        .detail-value {
          font-size: 14px;
          color: #333;
          line-height: 1.5;
        }
        
        .doctor-info {
          background-color: #fff9e6;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #FFB700;
          margin-bottom: 20px;
        }
        
        .doctor-name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        
        .doctor-specialty {
          font-size: 13px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .doctor-fee {
          font-size: 12px;
          color: #0066FF;
          font-weight: bold;
        }
        
        .info-box {
          background-color: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          font-size: 13px;
          color: #1565c0;
          line-height: 1.6;
        }
        
        .info-box strong {
          color: #0d47a1;
        }
        
        .action-items {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .action-items-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
          font-size: 12px;
        }
        
        .action-items ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .action-items li {
          font-size: 12px;
          color: #666;
          padding: 5px 0;
          padding-left: 20px;
          position: relative;
        }
        
        .action-items li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #00B341;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          color: #999;
          font-size: 11px;
          line-height: 1.8;
        }
        
        .footer-text {
          margin: 5px 0;
        }
        
        .timestamp {
          color: #aaa;
          font-size: 10px;
          margin-top: 15px;
        }
        
        .confirmation-code {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          letter-spacing: 1px;
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
          <div class="subtitle">Appointment Confirmation</div>
          <div class="success-badge">✓ Confirmed</div>
          <div class="confirmation-number">Confirmation ID: ${generateConfirmationId()}</div>
        </div>
        
        <!-- Main Message -->
        <div class="section">
          <div class="info-box">
            <strong>Appointment Confirmed!</strong><br>
            Your appointment has been successfully scheduled. Please review the details below and save this confirmation for your records.
          </div>
        </div>
        
        <!-- Doctor Information -->
        <div class="section">
          <div class="section-title">Doctor Information</div>
          <div class="doctor-info">
            <div class="doctor-name">${doctorName}</div>
            <div class="doctor-specialty">Specialty: ${specialty}</div>
            <div class="doctor-fee">Consultation Fee: ${fee}</div>
          </div>
        </div>
        
        <!-- Appointment Details -->
        <div class="section">
          <div class="section-title">Appointment Details</div>
          <div class="appointment-details">
            <div class="detail-row">
              <div class="detail-label">📅 Date</div>
              <div class="detail-value">${formatDateForDisplay(date)}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">⏰ Time</div>
              <div class="detail-value">${time}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">💻 Type</div>
              <div class="detail-value">${appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</div>
            </div>
            ${reason ? `
              <div class="detail-row">
                <div class="detail-label">📝 Reason</div>
                <div class="detail-value">${reason}</div>
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- What to Do Next -->
        <div class="section">
          <div class="section-title">What to Do Next</div>
          <div class="action-items">
            <div class="action-items-title">Please take note of the following:</div>
            <ul>
              ${appointmentType === 'video' ? `
                <li>Join the video consultation 5 minutes before the scheduled time</li>
                <li>Ensure your camera and microphone are working properly</li>
                <li>Find a quiet, well-lit place for the consultation</li>
              ` : `
                <li>Arrive at least 10 minutes before your appointment</li>
                <li>Bring any relevant medical documents</li>
                <li>Have your health insurance card ready</li>
              `}
              <li>A reminder email will be sent 24 hours before your appointment</li>
              <li>You can reschedule or cancel up to 24 hours before the appointment</li>
            </ul>
          </div>
        </div>
        
        <!-- Important Information -->
        <div class="section">
          <div class="section-title">Important Information</div>
          <div class="info-box">
            <strong>Cancellation Policy:</strong> You can cancel or reschedule your appointment up to 24 hours before the scheduled time without any charges.
          </div>
          <div class="info-box">
            <strong>Privacy & Confidentiality:</strong> All consultations are private and confidential. Your medical information is protected under our privacy policy.
          </div>
        </div>
        
        <!-- Contact Information -->
        <div class="section">
          <div class="section-title">Need Help?</div>
          <div style="font-size: 13px; color: #666; line-height: 1.6;">
            <p><strong>Email:</strong> support@diagnosync.com</p>
            <p><strong>Phone:</strong> +1-800-DIAGNOSYNC</p>
            <p><strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM (EST)</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-text">This is an automated confirmation from DiagnoSync</div>
          <div class="footer-text">Please do not reply to this email</div>
          <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
          <div class="confirmation-code">APT-${generateConfirmationId()}</div>
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
      filename: `appointment_confirmation_${date}_${new Date().getTime()}.pdf`,
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

// Helper function to generate confirmation ID
const generateConfirmationId = () => {
  return 'APT' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Helper function to format dates
const formatDateForDisplay = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
