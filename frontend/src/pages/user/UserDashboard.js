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
  Revenue: [
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
  Election: [
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
  Education: ["Primary Education", "Secondary Education", "Higher Education"],
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [ln, setLn] = useState(0);

  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const toast = useToast();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [documents]);

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = documents.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

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

  const applyDateFilter = () => {
    if (!filterDate) return;
    console.log(filterDate);

    const filtered = allDocuments.filter((doc) => {
      const docDate = new Date(doc.createdAt).toISOString().split("T")[0];
      return docDate === filterDate;
    });

    setDocuments(filtered);
  };

  const clearDateFilter = () => {
    setFilterDate("");
    setDocuments(allDocuments); // restore original list
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 || !branch || !department) {
      alert("Please fill all fields and select at least one PDF.");
      return;
    }

    setIsLoading(true);

    try {
      for (const file of selectedFiles) {
        // 1. Upload file (postPDF should accept a File object and return a URL)
        const uploadedUrl = await postPDF(file);

        if (!uploadedUrl) {
          toast({
            title: `Upload failed for ${file.name}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          continue;
        }

        // 2. Save metadata to backend
        const res = await axios.post(
          "http://localhost:4000/api/v1/userctrl/upload",
          {
            file_name: file.name,
            file_path: uploadedUrl,
            branch,
            department,
          }
        );

        if (res.data.success) {
          toast({
            title: `Uploaded: ${file.name}`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: `Failed to save: ${file.name}`,
            description: res.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }

      // Clear form and refresh
      setSelectedFiles([]);
      setBranch("");
      setDepartment("");
      setPdfUrl("");
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error uploading documents",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    setIsLoading(false);
  };


  const fetchDocuments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/v1/userctrl/get-doc"
      );
      if (res.data.success) {
        setDocuments(res.data.documents || []);
        setAllDocuments(res.data.documents || []);
        setLn(res.data.documents.length);
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
        setAllDocuments(res.data.documents || []);
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
    <div className="">
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
              flexDirection: "column",
            }}
          >
            <div>
              Hi{" "}
              <span style={{ color: "red", marginLeft: "3px" }}>
                {user.user.name}
              </span>
              , Welcome to Your Dashboard
            </div>
            <p style={{ margin: "0" }}>{user.user.email}</p>
          </div>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="container mt-5 mb-5">
        <div
          className="dfdf"
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
              // borderRadius: "12px",
              backgroundColor: "white",
            }}
          >
            <h3 className="mb-4">
              <span style={{ color: "rgb(22, 40, 243)" }}>Upload</span> your{" "}
              <span>Document</span>
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
                type="file"
                accept="application/pdf"
                multiple
                className="form-control"
                onChange={(e) => {
                  const filesArray = Array.from(e.target.files);
                  setSelectedFiles(filesArray);
                }}
              />
              {selectedFiles.length > 0 && (
                <ul className="mb-3 list-group">
                  {selectedFiles.map((file, idx) => (
                    <li
                      key={idx}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span style={{ width: "15rem" }}>{file.name}</span>
                      <button
                        className="btn btn-sm btn-outline-danger ms-1"
                        onClick={() => {
                          const updatedFiles = selectedFiles.filter(
                            (_, i) => i !== idx
                          );
                          setSelectedFiles(updatedFiles);
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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
              <h1 style={{ fontWeight: "400" }}>You have uploaded</h1>
              <h1 style={{ color: "green" }}>{ln}</h1>
              <h1 style={{ fontWeight: "400" }}>documents.</h1>
            </div>
          </div>
        </div>
        <hr />

        <h5 className="mt-4 mb-3">
          Your <span style={{ color: "rgb(22, 40, 243)" }}>Uploaded</span>{" "}
          Documents
        </h5>
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

        {/* Date Filter Section */}
        <div className="row mb-3">
          <div className="col-md-4">
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          <div className="col-md-4 d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={applyDateFilter}
            >
              Apply Date Filter
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                clearDateFilter();
                setFilterDate("");
              }}
            >
              Clear Date Filter
            </button>
          </div>
        </div>

        {documents.length === 0 ? (
          <p>No documents uploaded yet.</p>
        ) : (
          <div>
            <div style={{ margin: "0px 0 12px 0", textAlign: "center" }}>
              <span style={{ color: "blue" }}>{documents.length}</span>{" "}
              Documents
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {currentDocuments.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    // Width: "15rem",
                    minHeight: "20rem",
                    margin: "2rem",
                    border: "1px solid rgb(218, 212, 212)",
                    padding: "2rem 1rem",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      width: "15rem",
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ width: "15rem" }}>{doc.file_name}</strong>

                    <br />
                    <hr
                      style={{
                        backgroundColor: "green",
                        height: "6px",
                        borderRadius: "12px",
                        width: "80%",
                      }}
                    />
                    <small>
                      {doc.branch} → {doc.department}
                    </small>
                    <p style={{ marginTop: "1rem" }}>
                      {new Date(doc.createdAt).toLocaleString("en-IN", {
                        weekday: "long", // "short", "long", etc.
                        year: "numeric",
                        month: "long", // "numeric", "2-digit", etc.
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        hour12: true, // 12-hour format, set to false for 24-hour format
                      })}
                    </p>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/document/${doc._id}`)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-sm btn-secondary"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`btn btn-sm mx-1 ${
                    currentPage === i + 1
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-sm btn-secondary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
