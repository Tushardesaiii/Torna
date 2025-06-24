import React, { useState, useEffect } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import axios from "axios";

const Navbar = ({ toggleDarkMode, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/v1/users/logout", {}, { withCredentials: true });
      refreshUser();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 px-6 md:px-16 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "py-3 bg-white/90 dark:bg-black/90 border-b border-gray-100 dark:border-gray-900 shadow-md"
          : "py-5 bg-white dark:bg-black border-b border-transparent"
      } text-black dark:text-white backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter font-outfit hover:opacity-80 transition-opacity duration-200"
        >
          Torna
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {/* Only show these if user is NOT logged in */}
          {!currentUser && (
            <>
              <a
                href="#features"
                className="text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#users"
                className="text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                For Writers
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              >
                Pricing
              </a>
            </>
          )}

          {/* Dark Mode Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 border border-black dark:border-white text-black dark:text-white text-sm font-medium rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/register"
              className="px-5 py-2 border border-black dark:border-white text-black dark:text-white text-sm font-medium rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-black dark:text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-6 flex flex-col items-center space-y-5">
          {!currentUser && (
            <>
              <a
                href="#features"
                className="text-base font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Features
              </a>
              <a
                href="#users"
                className="text-base font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                For Writers
              </a>
              <a
                href="#pricing"
                className="text-base font-medium hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </a>
            </>
          )}

          {currentUser ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-4/5 text-center px-6 py-3 border border-black dark:border-white text-black dark:text-white text-base font-medium rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 shadow-sm"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-4/5 text-center px-6 py-3 border border-black dark:border-white text-black dark:text-white text-base font-medium rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 shadow-sm"
            >
              Get Started
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
