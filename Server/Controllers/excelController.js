require("dotenv").config();
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const DataModel = require("../Model/dataModel.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getLogFileName = () => {
  const logsDir = path.join(__dirname, "../logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir); // Create logs folder if it doesn't exist
  }

  const files = fs.readdirSync(logsDir);
  const logFiles = files.filter(
    (file) => file.startsWith("Log_File_") && file.endsWith(".txt")
  );

  const logNumber = logFiles.length + 1; // Increment log number based on existing files
  return path.join(
    logsDir,
    `Log_File_${logNumber.toString().padStart(2, "0")}.txt`
  );
};

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

    // Create a unique log file
    const logFilePath = getLogFileName();
    fs.writeFileSync(logFilePath, ""); // Initialize the log file

    // Send Emails
    for (const row of data) {
      const { HR_name, Company_name, Email } = row;

      const mailOptions = {
        from: process.env.EMAIL,
        to: Email,
        subject: `Invitation to CareerFeast`,
        text:
          `Dear ${HR_name},\n\n` +
          `I hope this message finds you well.\n\n` +
          `We are excited to invite ${Company_name} to participate in **CareerFeast**, an upcoming career fair designed to connect top talent with leading companies like yours.\n\n` +
          `### Event Details ###\n\n` +
          `**Event Date**: 14-December-2024\n` +
          `**Location**: Karachi University - UBIT\n\n` +
          `Please let us know if you’re interested in participating. We would be delighted to provide more details about the registration process and opportunities.\n\n` +
          `Looking forward to your positive response.\n\n` +
          `Warm regards,\n` +
          `Abdul Wasay\n` +
          `UBIT`,
      };

      try {
        await transporter.sendMail(mailOptions);

        // Log success to the text file
        const successMessage =
          `Successfully sent email to ${Company_name}\n` +
          `HR Details:\n` +
          `Name: ${HR_name}\n` +
          `Email: ${Email}\n` +
          `---------------------------------------------\n`;

        fs.appendFileSync(logFilePath, successMessage);
      } catch (error) {
        console.error(`Error sending email to ${Email}:`, error);
        continue;
      }

      await delay(1000); // 1-second delay
    }

    // Clean up the uploaded file after processing
    fs.unlinkSync(filePath);

    res
      .status(200)
      .send(`File processed, emails sent, and log created at ${logFilePath}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing file or sending emails.");
  }
};

module.exports = {
  uploadExcel,
};
