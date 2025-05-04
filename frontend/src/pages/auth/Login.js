import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/AuthStyles.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ConState } from "../../context/ConProvider";
import { useToast } from "@chakra-ui/react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = ConState();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/v1/auth/login", {
        email,
        password,
      });
      console.log(res.data);
      if (res.data.success) {
        toast({
          title: res.data.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        setUser({
          ...user,
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
        if(res.data.user.role===1)navigate("/dashboard/admin");
        else navigate("/dashboard/user");
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
      toast({
        title: "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div>
      <div
        className="form-container"
        style={{ height: "100vh" }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid black",
            width:"18rem"
          }}
        >
          <h4 className="title">Login</h4>

          <div className="mb-3 ">
            <TextField
              style={{ width: "100%" }}
              id="outlined-basic"
              label="Email"
              variant="outlined"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
            />
          </div>

          <div className="mb-3">
            <TextField
              style={{ width: "100%" }}
              id="outlined-password-input"
              label="Password"
              type="password"
              // autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
            />
          </div>
          <div className="mb-3">
            <div style={{ fontSize: "13px" }}>
              Don't have account?{" "}
              <span
                onClick={() => navigate("/register")}
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Register
              </span>
            </div>
            <Button
              style={{ marginTop: "0.9rem" }}
              variant="contained"
              type="submit"
            >
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
