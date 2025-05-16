import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthUser } from "../../redux/userSlice";

const SignIn = ({ onClose, onSwitchToSignUp, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 🔹 Loading state
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (user.success && !loggedIn) {
      console.log("User logged in successfully", user);
      setLoggedIn(true);
    }
  }, [user, loggedIn]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // 🔹 Validation
    if (!user.email || !user.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true); // 🔹 Start loading

    try {
      const res = await axios.post(
        `http://localhost:8080/api/users/login`,
        user,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Ensures cookies (for session-based auth)
        }
      );

      if (res.data.success) {
        toast.success("Login successful!");
        // console.log(res);
        dispatch(setAuthUser(res.data)); // 🔹 Dispatch login action
        onLoginSuccess(res.data.user);
        onClose(); // 🔹 Close modal
        navigate("/"); // 🔹 Redirect after login
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      toast.error(
        err.response?.data?.message || "Login failed! Check your credentials."
      );
    } finally {
      setLoading(false); // 🔹 Stop loading
    }

    setUser({ email: "", password: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0f172a] p-8 rounded-2xl w-[400px] shadow-xl border border-primary/20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-primary transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submitHandler} className="mb-4">
          <input
            type="email"
            placeholder="Enter your Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl mb-4 border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-primary hover:bg-primary/70 active:bg-primary/80"
            } text-white py-2.5 rounded-xl mb-4 transition-colors font-medium`}
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          New user?{" "}
          <button
            onClick={onSwitchToSignUp}
            className="text-primary hover:text-primary/90 hover:underline transition-colors"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
