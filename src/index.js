import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import QuestionPage from './question';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClvyHek26JNL87oDOtiIHVfsgS-PRA_sc",
  authDomain: "argbase-82c12.firebaseapp.com",
  projectId: "argbase-82c12",
  storageBucket: "argbase-82c12.appspot.com",
  messagingSenderId: "948867298825",
  appId: "1:948867298825:web:34931c0c8dc4e0f5202ad8",
  measurementId: "G-0MFVSBX81V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App db={db}/>} />
      <Route path="/question" element={<QuestionPage db={db}/>} />
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
