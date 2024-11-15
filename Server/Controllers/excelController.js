require("dotenv").config();
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const path = require("path");
const DataModel = require("../Model/dataModel.js");
const fs = require("fs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Handle file upload and processing
const uploadExcel = async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    // Parse Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Save data to MongoDB
    await DataModel.insertMany(data);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Send Emails
    for (const row of data) {
      const { HR_name, Company_name, Email } = row;

      const mailOptions = {
        from: process.env.EMAIL,
        to: Email,
        subject: `Invitation to Participate in CareerFeast Event`,
        text:
          `Dear ${HR_name},\n\n` +
          `I hope this message finds you well.\n\n` +
          `I am writing to extend a formal invitation for ${Company_name} to participate in CareerFeast, an exciting career fair that connects top talent with leading companies. ` +
          `This event presents a unique opportunity to engage with a diverse pool of candidates, build your employer brand, and discover skilled professionals who are eager to contribute to your organization.\n\n` +
          `Event Details:\n\n` +
          `Event Date: 14-December-2024\n` +
          `Location: Karachi University- UBIT\n\n` +
          `Please let us know if you’re interested in participating, and we would be happy to provide more details about the registration process and available opportunities.\n\n` +
          `We look forward to your positive response and hope to see you at CareerFeast!\n\n` +
          `Warm regards,\n` +
          `Abdul Wasay\n` +
          `UBIT`,
      };

      await transporter.sendMail(mailOptions);
      await delay(1000); //1sec delay
    }

    // Clean up the uploaded file after processing
    fs.unlinkSync(filePath);

    res.status(200).send("File processed and emails sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing file or sending emails.");
  }
};

module.exports = {
  uploadExcel,
};
