import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "../../styles/AuthStyles.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useToast } from "@chakra-ui/react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
      const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/v1/auth/register", {
        name,
        email,
        password,
      });
      if (res && res.data.success) {
        toast({
          title: res.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
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
      // console.log(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div>
      <div
        className="form-container p-5 login-page"
        style={{ height: "100vh" }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
            width: "20rem",
            padding: "4rem 2rem",
          }}
        >
          <h4 className="title">
            <span style={{color:"red"}}>Register</span> to get in!
          </h4>
          <TextField
            className="mb-3"
            id="outlined-basic"
            label="Name"
            variant="outlined"
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
          />
          <TextField
            className="mb-3"
            id="outlined-basic"
            label="Email"
            variant="outlined"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          <TextField
            className="mb-3"
            id="outlined-password-input"
            label="Password"
            type="password"
            // autoComplete="current-password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />

          <div style={{ fontSize: "13px" }}>
            Have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{
                color: "blue",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              login
            </span>
          </div>

          <Button
            style={{ marginTop: "0.9rem" }}
            variant="contained"
            type="submit"
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
