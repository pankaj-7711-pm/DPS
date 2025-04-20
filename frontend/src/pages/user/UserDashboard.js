import React, { useState, useEffect } from "react";
import axios from "axios";
import { ConState } from "../../context/ConProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

const UserDashboard = () => {
  const { user, setUser } = ConState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const postPDF = async (file) => {
    setIsLoading(true);

    if (!file) {
      alert("Please select a PDF file!");
      setIsLoading(false);
      return;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "duon0scym");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/duon0scym/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      setPdfUrl(result.url);
      console.log("Cloudinary PDF URL:", result.url);
      return result.url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload a PDF file first");
      return;
    }

    const uploadedUrl = await postPDF(selectedFile);
    if (!uploadedUrl) return;

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/userctrl/upload",
        {
          file_name: selectedFile.name,
          file_path: uploadedUrl,
        }
      );

      if (res.data.success) {
        toast({
          title: res.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        setSelectedFile(null);
        setPdfUrl("");
        fetchDocuments(); // refresh list after upload
      } else {
        toast({
          title: res.data.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      toast({
        title: "Error in uploading document",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/userctrl/get-doc"
      );
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
      
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleLogout = () => {
    setUser({
      ...user,
      user: null,
      token: "",
    });
    localStorage.removeItem("auth");
    navigate("/");
    toast({
      title: "Logout Successful",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-light justify-content-end px-4">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="container mt-5">
        <h3 className="mb-4">Welcome to Your Dashboard</h3>

        <div className="mb-3">
          <label htmlFor="pdfUpload" className="form-label">
            Upload PDF
          </label>
          <input
            className="form-control"
            type="file"
            id="pdfUpload"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="mb-3">
            <p className="text-success">
              <strong>Uploaded File:</strong> {selectedFile.name}
            </p>
          </div>
        )}

        <button
          className="btn btn-primary mb-4"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Uploading..." : "Submit"}
        </button>

        {/* Horizontal Line */}
        <hr />

        {/* Uploaded Documents */}
        <h5 className="mt-4 mb-3">Your Uploaded Documents</h5>
        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul className="list-group">
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {doc.file_name}
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate(`/document/${doc._id}`)}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
