import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import SignIn from './views/signin';
import SignUp from './views/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  )
}

export default App
