import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './views/login';
import SignUp from './views/signup';
import Home from './views/home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
