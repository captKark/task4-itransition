import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // If a token exists in local storage, load it in axios
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Login command
  const login = (userData, userToken) => {
    setToken(userToken);
    setUser(userData);
  };

  // Logiut/block command
  const logout = () => {
    setToken(null);
    setData(null);
  };

  return (<AuthContext.Provider value={{ user, token, loading, login, logout, setUser, setLoading }}>
    {children}
  </AuthContext.Provider>
  );
};
