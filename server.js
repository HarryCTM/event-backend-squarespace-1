const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Enable JSON requests with a limit for Base64 PDF data
app.use(bodyParser.json({ limit: '10mb' }));

// Endpoint to handle email sending
app.post('/send-email', async (req, res) => {
  try {
    const { name, email, phone, uniqueCode, pdfData } = req.body;
    
    // Configure the mail transporter using environment variables
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Email options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invoice and Ticket for Event',
      text: `Hello ${name},

Thank you for registering for the event. Attached you will find your invoice and entry ticket.
Your unique code is: ${uniqueCode}

See you at the event!
Regards,`,
      attachments: [
        {
          filename: 'event_ticket.pdf',
          content: pdfData.split(',')[1], // Remove the Data URI prefix "data:application/pdf;base64,"
          encoding: 'base64'
        }
      ]
    };
    
    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
