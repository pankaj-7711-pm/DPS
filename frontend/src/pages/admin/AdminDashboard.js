import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ConState } from "../../context/ConProvider";
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
} from "@chakra-ui/react";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchEmail, setSearchEmail] = useState("");
  const [logs, setLogs] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const { user, setUser } = ConState();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchUsers = async () => {
    let url = "http://localhost:4000/api/v1/adminctrl/getAllUsers";
    if (filter === "active")
      url = "http://localhost:4000/api/v1/adminctrl/getAllActiveUsers";
    if (filter === "inactive")
      url = "http://localhost:4000/api/v1/adminctrl/getAllInactiveUsers";

    try {
      const response = await axios.get(url);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const handleStatusChange = async (email, status) => {
    try {
      const res = await axios.put(
        "http://localhost:4000/api/v1/adminctrl/changeStatus",
        {
          email,
          statusValue: status,
        }
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
        setUsers([response.data.user]);
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
      <nav className="navbar navbar-light bg-light justify-content-end px-4">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="container mt-4">
        <h1 className="mb-4">Admin Dashboard</h1>

        <div className="mb-3">
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

        {users.length > 0 ? (
          <div className="list-group">
            {users.map((user, index) => (
              <div
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <p className="mb-1">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="mb-1">
                    <strong>Status:</strong>{" "}
                    {user.status === 1 ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="btn-group">
                  {user.status === 1 ? (
                    <button
                      onClick={() => handleStatusChange(user.email, 0)}
                      className="btn btn-danger"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(user.email, 1)}
                      className="btn btn-success"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => handleViewLogs(user._id, user.email)}
                    className="btn btn-secondary"
                  >
                    View Logs
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">No users found.</div>
        )}
      </div>

      {/* Log Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logs for {selectedUserEmail}</ModalHeader>
          <ModalCloseButton />
          <ModalBody
            maxH="400px"
            overflowY="auto"
            px={4}
            py={2}
            sx={{
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "4px",
              },
            }}
          >
            {logLoading ? (
              <div className="d-flex justify-content-center py-4">
                <Spinner size="lg" />
              </div>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log._id}
                  className="border rounded p-3 mb-3"
                  style={{ backgroundColor: "#f9f9f9" }}
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
              <p>No logs found for this user.</p>
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
    </>
  );
};

export default AdminDashboard;
