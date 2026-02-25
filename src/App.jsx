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


const RootLayout = () => {
  return (
    <>
      <EnvironmentBanner />
      <NavigationBar />
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
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home/>} />
          <Route path="/question" element={<QuestionPage db={db}/>} />
          <Route path="/compose-answer" element={<ComposeAnswer db={db} />} />
          <Route path="/about" element={<About/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
