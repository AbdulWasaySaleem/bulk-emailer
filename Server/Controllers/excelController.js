require('dotenv').config();
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const path = require("path");
const DataModel = require("../Model/dataModel.js");
const fs = require("fs");

// Nodemailer transporter setup
console.log("controller Email:", process.env.EMAIL);
console.log("controller Email Password:", process.env.EMAIL_PASSWORD);

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

    // Send Emails
    for (const row of data) {
      const { HR_name, Company_name, Email } = row;

      const mailOptions = {
        from: process.env.EMAIL,
        to: Email,
        subject: `Hello from ${Company_name}`,
        text: `Dear ${HR_name},\n\nThis is an automated email from ${Company_name}.`,
      };

      await transporter.sendMail(mailOptions);
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
