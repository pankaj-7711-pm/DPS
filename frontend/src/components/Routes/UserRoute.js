import { useState, useEffect } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import Spinner from "../../pages/Spinner";
import { ConState } from "../../context/ConProvider";


export default function UserRoute() {
  const [ok, setOk] = useState(false);
    const { user, setUser } = ConState();

  useEffect(() => {
    const authCheck = async () => {
      const res = await axios.get(
        "/api/v1/auth/user-auth"
      );
      if (res?.data?.ok) {
        setOk(true);
      } else {
        setOk(false);
      }
    };
    if (user?.token) {
      authCheck();
    }
  }, [user?.token]);

  return ok ? <Outlet /> : <Spinner path="login"/>;
}
