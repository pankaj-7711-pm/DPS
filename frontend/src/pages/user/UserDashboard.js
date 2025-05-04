import React, { useState, useEffect } from "react";
import axios from "axios";
import { ConState } from "../../context/ConProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";

const branchDeptOptions = {
  "General Administration": [
    "Chitnish",
    "Deputy Chitnish",
    "Public Relations Officer (PRO)",
    "Registry",
    "Records",
    "Accounts",
    "Legal",
    "Protocol",
  ],
  "Revenue": [
    "Land Records",
    "City Survey",
    "District Inspector Land Records (DILR)",
    "Superintendent of Land Records (SLR)",
    "Non-Agriculture (NA)",
    "Tenancy",
    "Urban Land Ceiling (ULC)",
    "Stamp Duty",
    "Land Acquisition",
  ],
  "Disaster Management": ["Disaster Response", "Relief Coordination"],
  "Election": [
    "District Election Office",
    "Deputy District Election Officer",
    "Mamlatdar Election",
  ],
  "Supply & Consumer Affairs": [
    "District Supply Office",
    "Mid-Day Meal (MDM)",
    "Small Savings",
  ],
  "Planning & Development": [
    "District Planning Office",
    "Development Authorities (e.g., DUDA, AVKUDA)",
  ],
  "Geology & Mining": ["Geology & Mining Branch"],
  "Education": ["Primary Education", "Secondary Education", "Higher Education"],
  "Health & Family Welfare": ["Health Department", "Family Welfare Schemes"],
  "Social Welfare": [
    "Social Justice & Empowerment",
    "Women & Child Development",
    "Tribal Development",
  ],
  "Municipality / Urban Governance": [
    "Municipality Coordination",
    "Urban Development",
  ],
  "Agriculture & Allied Services": [
    "Agriculture Department",
    "Animal Husbandry",
    "Irrigation",
    "Fisheries",
  ],
  "Law & Order / Magistracy": [
    "Magistrate Branch",
    "Entertainment Tax",
    "Legal Affairs",
  ],
  "Field Administration": [
    "Prant Offices",
    "Mamlatdar Offices (Taluka-level administration)",
  ],
};

const UserDashboard = () => {
  const { user, setUser } = ConState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [ln, setLn] = useState(0);

  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const postPDF = async (file) => {
    setIsLoading(true);
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
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
      return result.url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !branch || !department) {
      alert("Please fill all fields");
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
          branch,
          department,
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
        setBranch("");
        setDepartment("");
        fetchDocuments();
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
        title: "Error uploading document",
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
        setLn(res.data.documents.length)
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const applyFilter = async () => {
    if (!filterBranch || !filterDepartment) {
      alert("Select both branch and department to apply filter.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/userctrl/filter-docs",
        {
          branch: filterBranch,
          department: filterDepartment,
        }
      );
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (error) {
      toast({
        title: "Failed to apply filter",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const clearFilter = () => {
    setFilterBranch("");
    setFilterDepartment("");
    fetchDocuments();
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleLogout = () => {
    setUser({ ...user, user: null, token: "" });
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
      <nav className="navbar navbar-light bg-light justify-content-between px-4">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Avatar style={{ marginRight: "5px" }} name={user.user.name} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              // alignItems: "center",
              flexDirection:"column"
            }}
          >
            <div>
              Hi{" "}
              <span style={{ color: "red", marginLeft: "3px" }}>
                {user.user.name}
              </span>
              , Welcome to Your Dashboard
            </div>
            <p style={{margin:"0"}}>{user.user.email}</p>
          </div>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="container mt-5 mb-5">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            padding: "0",
          }}
        >
          <div
            className="aaa"
            style={{
              padding: "2rem 2rem 1rem 2rem",
              borderRadius: "12px",
            }}
          >
            <h3 className="mb-4">
              <span style={{ color: "blue" }}>Upload</span> your{" "}
              <span style={{ color: "blue" }}>Document</span>
            </h3>

            <div className="mb-3">
              <label className="form-label">Select Branch</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setDepartment("");
                }}
              >
                <option value="">-- Select Branch --</option>
                {Object.keys(branchDeptOptions).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {branch && (
              <div className="mb-3">
                <label className="form-label">Select Department</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">-- Select Department --</option>
                  {branchDeptOptions[branch].map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Upload PDF</label>
              <input
                className="form-control"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>

            <button
              className="btn btn-primary mb-4"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Submit"}
            </button>
          </div>
          <div style={{ width: "60%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                flexDirection: "column",
              }}
            >
              <h1>You have uploaded</h1>
              <h1 style={{ color: "green" }}>{ln}</h1>
              <h1>documents.</h1>
            </div>
          </div>
        </div>
        <hr />

        <h5 className="mt-4 mb-3">Your Uploaded Documents</h5>
        <div className="row mb-3">
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterBranch}
              onChange={(e) => {
                setFilterBranch(e.target.value);
                setFilterDepartment("");
              }}
            >
              <option value="">-- Filter by Branch --</option>
              {Object.keys(branchDeptOptions).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              disabled={!filterBranch}
            >
              <option value="">-- Filter by Department --</option>
              {filterBranch &&
                branchDeptOptions[filterBranch].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={applyFilter}>
              Apply Filter
            </button>
            <button className="btn btn-outline-secondary" onClick={clearFilter}>
              Clear Filter
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <ul className="list-group">
            <div style={{ margin: "0px 0 12px 0", textAlign: "center" }}>
              <span style={{ color: "blue" }}>{documents.length}</span>{" "}
              Documents
            </div>
            {documents.map((doc) => (
              <li
                key={doc._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{doc.file_name}</strong>
                  <br />
                  <small>
                    {doc.branch} → {doc.department}
                  </small>
                </div>
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
