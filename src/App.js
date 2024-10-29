import './App.css';
import React from 'react';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuestionPage from './question';
import Home from './home';
import ComposeAnswer from './compose-answer';

function App({ db }) {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/question" element={<QuestionPage db={db}/>} />
        <Route path="/compose-answer" element={<ComposeAnswer db={db} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
