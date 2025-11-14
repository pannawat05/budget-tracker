import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter , Route, Routes } from 'react-router-dom'
import './App.css'
import Add from './pages/add' 
import Activity from './pages/activity'
import Summary from './pages/summary'
import Nav from './components/Nav'
import Login from './pages/Login'
import Profile from './pages/Profile'

import React from 'react'

function App() {
  return (
    <>
      <Nav className="nav"/>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Activity/>} />
          <Route path="/add" element={<Add/>} />
          <Route path="/activity" element={<Activity/>}  />
          <Route path="/summary" element={<Summary/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/profile" element={<Profile/>} />
          </Routes>
       
      </BrowserRouter>
    </>
  )
}

export default App