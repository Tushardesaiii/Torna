import React, { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../components/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, username, email, password } = formData;

    if (!fullName || !username || !email || !password) {
      toast.error("Please fill in all the fields!");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsSuccess(false);

      const response = await axios.post(
        "http://localhost:8000/api/v1/users/register",
        { fullName, username, email, password },
        { withCredentials: true }
      );

      toast.success("Registration successful!");
      setIsSuccess(true);

      await refreshUser(); // Refresh user state after token set
      navigate("/"); // Redirect to dashboard
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="absolute -top-14 w-600 h-[497px] bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500 rounded-b-[90%] rounded-tr-[90%]"></div>

      <div className="relative top-8 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col"
        >
          <div className="text-center space-y-1">
            <h2 className="text-3xl text-black font-bold">Create an account</h2>
            <p className="text-sm text-gray-500">
              Join us today by filling in your details below.
            </p>
          </div>
          <br />

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Full Name
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
          </label>

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Username
            <input
              type="text"
              name="username"
              placeholder="johndoe123"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
          </label>

          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Email
            <input
              type="email"
              name="email"
              placeholder="pat@saturn.dev"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
              <button
                type="button"
                aria-label="Toggle Password Visibility"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600 mb-6">
            <input
              type="checkbox"
              className="checkbox checkbox-xs rounded-sm border-gray-300 focus:ring-orange-500"
            />
            Remember for 30 days
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-block rounded-full text-white font-semibold py-3 transition mb-4 shadow-md
              ${isSubmitting ? "bg-orange-400 border-orange-400 cursor-not-allowed" : "bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"}
              ${isSuccess ? "bg-green-500 border-green-500" : ""}
            `}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>

          <p className="text-center text-gray-700 mt-8 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
