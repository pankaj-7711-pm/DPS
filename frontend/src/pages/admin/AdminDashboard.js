import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ConState } from "../../context/ConProvider";
import { Avatar, Select } from "@chakra-ui/react";
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
  "Disaster- Management": ["Disaster Response", "Relief Coordination"],
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

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [logUser, setLogUser] = useState();
  const [selectedDate, setSelectedDate] = useState("");

  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [countData, setCountData] = useState("Total Users");

  const { user, setUser } = ConState();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLastDocument = currentPage * itemsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - itemsPerPage;
  const currentDocuments = documents.slice(
    indexOfFirstDocument,
    indexOfLastDocument
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(documents.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Pagination states (use different names)
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 5;

  const indexOfLastUser = userPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const totalUserPages = Math.ceil(users.length / usersPerPage);
  const userPageNumbers = Array.from(
    { length: totalUserPages },
    (_, i) => i + 1
  );

  const paginateUsers = (pageNum) => setUserPage(pageNum);

  const fetchUsers = async () => {
    let url = "http://localhost:4000/api/v1/adminctrl/getAllUsers";
    if (filter === "active") {
      url = "http://localhost:4000/api/v1/adminctrl/getAllActiveUsers";
      // setCountData("Total Active Users");
    }

    if (filter === "inactive") {
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

  const handleApplyFilter = async () => {
    setLogLoading(true);
    if (!selectedBranch || !selectedDepartment) return;

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/adminctrl/get-filter-logs",
        {
          email: selectedUserEmail,
          branch: selectedBranch,
          department: selectedDepartment,
        }
      );

      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Error filtering logs:", err);
    } finally {
      setLogLoading(false);
    }
  };

  const handleClearFilter = () => {
    setSelectedBranch("");
    setSelectedDepartment("");
    handleViewLogs(logUser, selectedUserEmail);
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/adminctrl/get-all-documents"
      );
      setDocuments(response.data.documents || []);
      setAllDocuments(response.data.documents || []);
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
      setAllDocuments(response.data.documents || []);
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
        setCountData("Total Searched Users");
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
    setLogUser(userId);
    setSelectedBranch("");
    setSelectedDepartment("");
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

  const applyDateFilter = () => {
    if (!selectedDate) return;
    console.log(selectedDate);

    const filtered = allDocuments.filter((doc) => {
      const docDate = new Date(doc.createdAt).toISOString().split("T")[0];
      return docDate === selectedDate;
    });

    setDocuments(filtered);
  };

  const clearDateFilter = () => {
    setSelectedDate("");
    setDocuments(allDocuments); // restore original list
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
        <h1 className="mb-4" style={{ fontWeight: "400" }}>
          Keep track of <span style={{ color: "red" }}>Everything!</span>
        </h1>

        <div className="mb-3 d-flex justify-content-between">
          <div>
            <button
              onClick={() => setFilter("all")}
              className="btn btn btn-outline-primary me-2"
            >
              All Users
            </button>
            <button
              onClick={() => setFilter("active")}
              className="btn btn-outline-success me-2"
            >
              Active Users
            </button>
            <button
              onClick={() => setFilter("inactive")}
              className="btn btn-outline-danger"
            >
              Inactive Users
            </button>
          </div>
          <div className="fs-5">
            {countData}: {users.length}
          </div>
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

        <div className="table-responsive mt-4">
          <table className="table table-striped table-bordered">
            <thead className="table-primary">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Logs</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, idx) => (
                <tr key={idx}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Switch
                      colorScheme="green"
                      isChecked={user.status === 1}
                      onChange={() =>
                        handleStatusChange(
                          user.email,
                          user.status === 1 ? 0 : 1
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewLogs(user._id, user.email)}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${userPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => paginateUsers(userPage - 1)}
                  disabled={userPage === 1}
                >
                  Previous
                </button>
              </li>
              {userPageNumbers.map((num) => (
                <li
                  key={num}
                  className={`page-item ${userPage === num ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginateUsers(num)}
                  >
                    {num}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  userPage === totalUserPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => paginateUsers(userPage + 1)}
                  disabled={userPage === totalUserPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-5">
          <h4>
            <span style={{ color: "red" }}>Filter</span> Documents
          </h4>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Branch</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setDepartment(""); // Reset department when branch changes
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

            <div className="col-md-4 d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setBranch("");
                  setDepartment("");
                  setSelectedDate("");
                  fetchDocuments();
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3">
              <button
                className="btn btn-outline-primary me-2"
                onClick={applyDateFilter}
              >
                Apply Filter by Date
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={clearDateFilter}
              >
                Clear Date Filter
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 mb-5">
          <h4 style={{ marginBottom: "2rem", textAlign: "center" }}>
            <span style={{ color: "blue" }}>{documents.length}</span> Documents
          </h4>
          <div className="row g-4">
            {currentDocuments.map((doc) => (
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
                  <p>
                    <strong>Uploaded by: </strong>
                    {doc.user_id.name}
                  </p>
                  <div
                    className="mt-auto"
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                      style={{ width: "40%" }}
                    >
                      View
                    </a>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary"
                      style={{ width: "40%" }}
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Page navigation example">
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {pageNumbers.map((number) => (
                  <li
                    key={number}
                    className={`page-item ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage === pageNumbers.length ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === pageNumbers.length}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
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
            <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <div className="mb-4">
                <div className="mb-2">
                  <Select
                    placeholder="Select Branch"
                    value={selectedBranch}
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      setSelectedDepartment("");
                    }}
                  >
                    {branchOptions.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="mb-2">
                  <Select
                    placeholder="Select Department"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    isDisabled={!selectedBranch}
                  >
                    {(departmentMap[selectedBranch] || []).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleApplyFilter}
                    style={{ marginRight: "10px" }}
                  >
                    Apply Filter
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleClearFilter}
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {logLoading ? (
                <div className="text-center py-4">
                  <Spinner size="lg" />
                </div>
              ) : logs.length > 0 ? (
                <>
                  <p style={{ fontWeight: "400" }}>
                    Total Logs:{" "}
                    <span style={{ color: "blue" }}>{logs.length}</span>
                  </p>
                  {logs.map((log) => (
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
                      <div>
                        <button className="btn btn-outline-primary me-2">
                          View
                        </button>
                        <button className="btn btn-outline-primary me-2">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </>
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
