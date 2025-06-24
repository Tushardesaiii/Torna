import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function Logout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully!");
      setLoading(false);
      // Redirect to login page
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div
        className="relative min-h-screen flex items-center justify-center bg-white"
        style={{ overflow: "hidden" }} // remove scrollbars
      >
        {/* Decorative background shape */}
        <div className="absolute -top-12 w-[1700px] h-[400px] bg-gradient-to-br from-gray-800 via-gray-600 to-zinc-400 rounded-b-[100%] rounded-tr-[90%]"></div>

        {/* Message container */}
        <div className="relative w-full max-w-md bg-white p-8 rounded-xl shadow-xl z-10 text-center space-y-5">
          <h2 className="text-3xl font-bold text-gray-800">
            Are you sure you want to log out?
          </h2>

          <p className="text-gray-500 text-sm">
            If you log out, you will be redirected to the login page. We hope
            to see you again soon!
          </p>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging out..." : "Confirm Logout"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Logout;
