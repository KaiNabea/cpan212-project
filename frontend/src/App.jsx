import React, { useState } from 'react'
import {Route, Routes, BrowserRouter} from "react-router-dom"
import NavBar from "./components/NavBar.jsx"
import Website from "./components/Website.jsx"
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = '/' element ={<Website />} />
        <Route path = '/Profile' element ={<Profile />} />
        <Route path = '/Reviews' element ={<Reviews />} />
        <Route path = '/Contact' element ={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}