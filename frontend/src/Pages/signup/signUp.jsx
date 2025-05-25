import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onClose, onSwitchToSignIn }) => {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name:'',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const submitHandler = async (e) => {
    e.preventDefault();

    // 🔹 Validation Checks
    if (!user.userName || !user.email || !user.password || !user.confirmPassword) {
      toast.error('All fields are required!');
      return;
    }

    if (user.password !== user.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      const res = await axios.post(`https://hectoclash-backend.onrender.com/api/users/register`, user, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
       onSwitchToSignIn();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }

    setUser({name:'',userName: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0f172a] p-8 rounded-2xl w-[400px] shadow-xl border border-primary/20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">Create Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-primary transition-colors p-1">✕</button>
        </div>

        <form onSubmit={submitHandler} className="mb-4">
        <input
            type="text"
            placeholder="Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl mb-4 border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <input
            type="text"
            placeholder="Username"
            value={user.userName}
            onChange={(e) => setUser({ ...user, userName: e.target.value })}
            className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl mb-4 border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          <input
            type="email"
            placeholder="Enter your Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl mb-4 border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />

          <div className="relative mb-4">
            <input
              type={showPassword1 ? "text" : "password"}
              placeholder="Enter your Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button type="button" onClick={() => setShowPassword1(!showPassword1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
              {showPassword1 ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Confirm Password"
              value={user.confirmPassword}
              onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
              className="w-full bg-[#1e293b] text-white py-2.5 px-4 rounded-xl border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
              {showPassword2 ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-primary/70 active:bg-primary/80 text-white py-2.5 rounded-xl mb-4 transition-colors font-medium">
            CREATE ACCOUNT
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <button onClick={onSwitchToSignIn} className="text-primary hover:text-primary/90 hover:underline transition-colors">
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
