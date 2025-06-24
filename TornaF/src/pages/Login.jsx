import React, { useState, useEffect } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../components/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth(); // 👈 use refreshUser from AuthContext

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/users/current-user",
          { withCredentials: true }
        );
        if (res?.data?.data?._id) {
          navigate("/");
        } else {
          setAuthChecked(true);
        }
      } catch {
        setAuthChecked(true);
      }
    };
    checkLoggedIn();
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Checking authentication...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      toast.error("Please fill in both username and password!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:8000/api/v1/users/login",
        { username, password },
        { withCredentials: true }
      );

      toast.success("Login successful!");

      await refreshUser(); // 👈 Instantly refresh global user state
      navigate("/"); // 👈 Redirect immediately
    } catch (err) {
      toast.error("Wrong credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="absolute -top-14 w-600 h-[497px] bg-gradient-to-br from-pink-400 via-purple-300 to-blue-300
 rounded-b-[90%] rounded-tr-[90%]"></div>

      <div className="relative w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col"
        >
          <div className="text-center space-y-1">
            <h2 className="text-3xl text-black font-bold">
              Sign in to your account
            </h2>
            <p className="text-sm text-gray-500">
              Welcome back. Please enter your details.
            </p>
          </div>

          <br />

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Username
            <input
              type="text"
              name="username"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          <div className="mb-4">
            <label className="flex justify-between items-center text-sm font-semibold text-gray-700 mb-1">
              Password
              <a href="#" className="text-orange-500 font-medium hover:underline">
                Forgot password?
              </a>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                aria-label="Toggle Password Visibility"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none disabled:cursor-not-allowed"
              >
                {showPassword ? (
                  <HiOutlineEyeOff size={20} />
                ) : (
                  <HiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6">
            <input
              type="checkbox"
              className="checkbox checkbox-xs rounded-sm border-gray-300 focus:ring-orange-500"
              disabled={loading}
            />
            Remember for 30 days
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-block rounded-full bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600 text-white font-semibold py-3 transition mb-4 shadow-md flex items-center justify-center"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-700 mt-8 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-orange-500 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
