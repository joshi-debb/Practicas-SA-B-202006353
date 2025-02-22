import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from './views/signin';
import SignUp from './views/signup';
import Home from './views/home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App
