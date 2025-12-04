import React, { useState } from 'react'
import {Route, Routes, BrowserRouter, useLocation} from "react-router-dom"
import NavBar from "./components/NavBar.jsx"
import Films from "./components/Films.jsx"
import Profile from "./components/Profile.jsx"
import Reviews from "./components/Reviews.jsx"
import Contact from "./components/Contact.jsx"
import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import {AuthProvider} from "./components/AuthContext.jsx"

function Navigation() {
  const location = useLocation()
  let urls = ["/users/login", "/users/register"]
  const hideNavBarLogin = location.pathname === urls[0]
  const hideNavBarRegister = location.pathname === urls[1]
  return (
    <div>
      {!hideNavBarLogin && !hideNavBarRegister && <NavBar />}
      <AuthProvider>
        <Routes>
          <Route path = '/users/login' element ={<Login />} />
          <Route path = '/users/register' element = {<Register />} />
          {/*<Route path = '/users/mainpage' element = {<Main />} />*/}
          <Route path = '/users/film' element = {
            <ProtectedRoute>
              <Films />
            </ProtectedRoute>
          } />
          <Route path = '/users/:id' element ={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path = '/users/review' element ={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          } />
          {/*<Route path = '/users/contact' element ={<Contact />} />*/}
        </Routes>
      </AuthProvider>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
        <Navigation />
    </BrowserRouter>
  )
}