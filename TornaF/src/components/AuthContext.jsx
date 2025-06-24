import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/v1/users/current-user",
        { withCredentials: true } // Ensures cookies are sent with the request
      );

      // --- CRITICAL FIX AREA: Correctly extract user data based on the observed response structure ---
      let userData = null;

      // The console log shows: data: {…} which means res.data.data IS the user object
      if (res.data && res.data.data && res.data.data._id !== undefined) {
          userData = res.data.data; // User object is directly under res.data.data
      }
      // Keep other checks as fallbacks if your other endpoints have different structures
      else if (res.data && res.data.user !== undefined) {
          userData = res.data.user;
      }
      else if (res.data && res.data._id !== undefined) {
          userData = res.data;
      }
      // --- END CRITICAL FIX AREA ---


      if (userData) {
        setCurrentUser(userData);
        console.log("✅ Fetched current user:", userData);
      } else {
        // If data structure is unexpected, or user is explicitly null/undefined in response
        console.warn("⚠️ Current user data not found in expected format or is null/undefined:", res.data);
        setCurrentUser(null); // Ensure currentUser is null if no valid user data found
      }

    } catch (err) {
      console.error(
        "❌ Auth fetch error:",
        err?.response?.data || err.message,
        err?.response?.status ? `(Status: ${err.response.status})` : ""
      );
      setCurrentUser(null); // Ensure currentUser is null on error
      if (err?.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.log("Tokens cleared due to authentication error.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshUser = async () => {
    setAuthLoading(true);
    await fetchCurrentUser();
  };

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, refreshUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);