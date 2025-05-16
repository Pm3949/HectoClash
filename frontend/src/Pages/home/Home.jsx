import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Nav from '../../components/Nav';

const Home = () => {
  const navigate = useNavigate();
  const { authUser } = useSelector((state) => state.user);
  const username = authUser?.userName || 'Hectoclash';

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-secondary/20 to-dark"></div>

      <Nav />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome {authUser ? 'back,' : 'to,'} <span className="text-primary">{username}!</span>
          </h1>
        </div>

        {/* What is Hecto Puzzle */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-primary/10 border border-primary/30 hover:border-primary/50 rounded-xl px-8 py-10 text-left shadow-lg w-full max-w-6xl mx-auto mb-10"
        >
          <h2 className="text-3xl font-bold text-white mb-4 border-b-2 border-primary inline-block pb-1">
            What is <span className="text-primary">Hecto Puzzle</span>?
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mt-2">
            <span className="text-white font-semibold">Hecto Puzzle</span> is an engaging numerical puzzle where you're challenged
            to manipulate six digits using arithmetic operations and parentheses to form an expression that evaluates exactly to
            <span className="text-primary font-semibold"> 100</span>. It's a test of both speed and logic, often played in competitive settings.
          </p>
        </motion.div>

        {/* Rules + Example */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-primary/10 border border-primary/30 hover:border-primary/50 rounded-xl px-8 py-10 text-left shadow-lg w-full max-w-6xl mx-auto"
        >
          {/* Rules Section */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-white mb-4 border-b-2 border-primary inline-block pb-1">
              Rules
            </h3>
            <ul className="list-disc list-inside text-gray-300 text-lg space-y-2 pl-4 mt-2">
              <li>You will be given 6 digits between 1–9 in the same order.</li>
              <li>You can use +, –, ×, ÷, ^ and parentheses.</li>
              <li>You must use all 6 digits exactly once.</li>
              <li>Your goal is to make the expression equal <span className="text-primary font-semibold">100</span>.</li>
              <li>Fastest correct answer wins the round!</li>
            </ul>
          </div>

          {/* Example Section */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-4 border-b-2 border-primary inline-block pb-1">
              Example
            </h3>
            <p className="text-gray-300 text-lg mb-4 mt-2">
              You’re given 6 digits (1–9) in order. Use operations to make them equal <span className="text-primary font-semibold">100</span>.
            </p>
            <div className="bg-black/30 border border-gray-600 rounded-lg px-6 py-4 text-base text-gray-200 font-mono">
              <p>Given: <span className="text-primary">123456</span></p>
              <p>Solution: <span className="text-primary">1 + (2 + 3 + 4) × (5 + 6) = 100</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;