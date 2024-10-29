import './App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuestionPage from './question';
import Home from './home';

function App({ db }) {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/question" element={<QuestionPage db={db}/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
