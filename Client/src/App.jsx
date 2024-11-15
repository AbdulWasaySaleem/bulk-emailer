import { useState } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please upload a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); // Set loading to true when the request starts

    try {
      const response = await axios.post(
        "http://localhost:5000/api/excel/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Error uploading file or sending emails.");
    } finally {
      setLoading(false); // Set loading to false once the request is finished
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload Excel File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload and Send Emails</button>
      </form>

      {/* Show loading spinner or message */}
      {loading ? (
        <p>Processing your request, please wait...</p>
      ) : (
        message && <p>{message}</p>
      )}
    </div>
  );
};

export default App;
