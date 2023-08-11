import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Controller from './Controller';
import Admin from './Admin';
import Profile from './Profile';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route exact path="/" element={<Profile />} />
      <Route exact path="/controller/:name" element={<Controller />} />
      <Route exact path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>,
  rootElement
);