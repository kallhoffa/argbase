import './App.css';
import React from 'react';

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import QuestionPage from './question';
import Home from './home';
import ComposeAnswer from './compose-answer';
import EnvironmentBanner from './environment-banner';
import About from './about';
import NavigationBar from './navigation-bar';
import Login from './login';
import Signup from './signup';
import Profile from './profile';
import AllQuestions from './all-questions';
import EveryQuestion from './every-question';


const RootLayout = ({ db }) => {
  return (
    <>
      <EnvironmentBanner />
      <NavigationBar db={db} />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
};


function App({ db }) {
  
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<RootLayout db={db} />}>
          <Route path="/" element={<Home/>} />
          <Route path="/question" element={<QuestionPage db={db}/>} />
          <Route path="/compose-answer" element={<ComposeAnswer db={db} />} />
          <Route path="/about" element={<About/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile db={db} />} />
          <Route path="/all-questions" element={<AllQuestions db={db} />} />
          <Route path="/all-questions/every" element={<EveryQuestion db={db} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
