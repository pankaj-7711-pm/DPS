import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ConContext = createContext();

const ConProvider = ({ children }) => {
  const [user, setUser] = useState({
    user: null,
    token: "",
  });
    
  //default axios
  axios.defaults.headers.common["Authorization"] = user?.token;

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parseData = JSON.parse(data);
      const decodedToken = jwtDecode(parseData.token);

      const currentTime = Date.now() / 1000; // in seconds
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("auth");
      } else {
        setUser({
          ...user,
          user: parseData.user,
          token: parseData.token,
        });
      }
    }

    // eslint-disable-next-line
  }, []);

  return (
    <ConContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </ConContext.Provider>
  );
};
export const ConState = () => {
  return useContext(ConContext);
};

export default ConProvider;
