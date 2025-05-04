import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ConState } from "../../context/ConProvider";
import { Avatar } from "@chakra-ui/react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Switch,
} from "@chakra-ui/react";

const branchOptions = [
  "General Administration",
  "Revenue",
  "Disaster- Management",
  "Election",
  "Supply & Consumer Affairs",
  "Planning & Development",
  "Geology & Mining",
  "Education",
  "Health & Family Welfare",
  "Social Welfare",
  "Municipality / Urban Governance",
  "Agriculture & Allied Services",
  "Law & Order / Magistracy",
  "Field Administration",
];

const departmentMap = {
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
  "Disaster- Management": ["Disaster Response", "Relief Coordination"],
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

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const [documents, setDocuments] = useState([]);
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [countData, setCountData] = useState("Total Users");

  const { user, setUser } = ConState();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchUsers = async () => {
    let url = "http://localhost:4000/api/v1/adminctrl/getAllUsers";
    if (filter === "active")
    {
      url = "http://localhost:4000/api/v1/adminctrl/getAllActiveUsers";
      // setCountData("Total Active Users");
    }
      
    if (filter === "inactive")
    {
      url = "http://localhost:4000/api/v1/adminctrl/getAllInactiveUsers";
      // setCountData("Total Inactive Users");
    }
      

    try {
      const response = await axios.get(url);
      setUsers(response.data.users || []);
      if (filter === "all") {
        setCountData("Total Users");
      }
      if (filter === "active") {
        setCountData("Total Active Users");
      }

      if (filter === "inactive") {
        setCountData("Total Inactive Users");
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/adminctrl/get-all-documents"
      );
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDocuments();
  }, [filter]);

  const handleStatusChange = async (email, status) => {
    try {
      const res = await axios.put(
        "http://localhost:4000/api/v1/adminctrl/changeStatus",
        { email, statusValue: status }
      );
      toast({
        title: res.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      fetchUsers();
    } catch (err) {
      console.error("Error changing status:", err);
    }
  };

  const handleApplyFilters = async () => {
    if (!department || !branch) {
      toast({
        title: "Please select both Department and Branch.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/adminctrl/filter-documents",
        { department, branch }
      );
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error("Error applying filters:", err);
      setDocuments([]);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) {
      fetchUsers();
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/adminctrl/getOneUsers",
        {
          email: searchEmail,
        }
      );
      if (response.data.success) {
        setUsers(response.data.user);
        setCountData("Total Searched Users")
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUsers([]);
    }
  };

  const handleViewLogs = async (userId, email) => {
    setSelectedUserEmail(email);
    setLogLoading(true);
    setIsLogModalOpen(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/adminctrl/get-user-logs",
        { user_id: userId }
      );
      if (response.data.success) {
        setLogs(response.data.logs);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    } finally {
      setLogLoading(false);
    }
  };

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
    <>
      <nav className="navbar navbar-light bg-light justify-content-space-between px-4">
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
              Hi <span style={{ color: "red", marginLeft: "3px" }}>Admin</span>,
              Welcome to Your Dashboard
            </div>
            <p style={{ margin: "0" }}>{user.user.email}</p>
          </div>
        </div>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <div className="container mt-4">
        <h1 className="mb-4">Keep track of Everything!</h1>

        <div className="mb-3 d-flex justify-content-between">
          <div>
            <button
              onClick={() => setFilter("all")}
              className="btn btn-primary me-2"
            >
              All Users
            </button>
            <button
              onClick={() => setFilter("active")}
              className="btn btn-success me-2"
            >
              Active Users
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className="btn btn-danger"
            >
              Inactive Users
            </button>
          </div>
          <div className="fs-5">{countData}: {users.length}</div>
        </div>
        <div className="mb-4 d-flex">
          <input
            type="email"
            placeholder="Search by email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="form-control me-2"
            style={{ maxWidth: "300px" }}
          />
          <button onClick={handleSearch} className="btn btn-dark">
            Search
          </button>
        </div>

        <div className="row g-3">
          {users.map((user, idx) => (
            <div key={idx} className="col-md-4">
              <div className="card p-3 d-flex flex-column h-100">
                <h5>{user.email}</h5>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <Switch
                    colorScheme="green"
                    isChecked={user.status === 1}
                    onChange={() =>
                      handleStatusChange(user.email, user.status === 1 ? 0 : 1)
                    }
                  />
                  <button
                    onClick={() => handleViewLogs(user._id, user.email)}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h4>Filter Documents</h4>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Branch</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setDepartment("");
                }}
              >
                <option value="">Select Branch</option>
                {branchOptions.map((br, i) => (
                  <option key={i} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {(departmentMap[branch] || []).map((dept, i) => (
                  <option key={i} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button
              className="btn btn-primary me-2"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setBranch("");
                setDepartment("");
                setDate("");
                fetchDocuments();
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-5 mb-5">
          <h4 style={{marginBottom:"2rem", textAlign:"center"}}>
            <span style={{color:"blue"}}>{documents.length}</span> Documents
          </h4>
          <div className="row g-4">
            {documents.map((doc) => (
              <div key={doc._id} className="col-md-4">
                <div className="card p-3 d-flex flex-column h-100">
                  <p>
                    <strong>File:</strong> {doc.file_name}
                  </p>
                  <p>
                    <strong>Branch:</strong> {doc.branch}
                  </p>
                  <p>
                    <strong>Department:</strong> {doc.department}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary mt-auto"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Logs for {selectedUserEmail}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {logLoading ? (
                <div className="text-center py-4">
                  <Spinner size="lg" />
                </div>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <div
                    key={log._id}
                    className="border rounded p-3 mb-3 bg-light"
                  >
                    <p>
                      <strong>Action:</strong> {log.action}
                    </p>
                    <p>
                      <strong>Document:</strong>{" "}
                      {log.document_id?.file_name || "N/A"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No logs found.</p>
              )}
            </ModalBody>
            <ModalFooter>
              <button
                className="btn btn-secondary"
                onClick={() => setIsLogModalOpen(false)}
              >
                Close
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default AdminDashboard;
