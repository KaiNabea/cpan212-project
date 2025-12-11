import React from 'react'
import {Route, Routes, BrowserRouter, useLocation, Navigate} from "react-router-dom"
import NavBar from "./components/NavBar.jsx"
import Main from "./components/Main.jsx"
import Films from "./components/Films.jsx"
import Profile from "./components/Profile.jsx"
import Reviews from "./components/Reviews.jsx"
import Contact from "./components/Contact.jsx"
import Login from "./components/Login.jsx"
import Logout from "./components/Logout.jsx"
import Register from "./components/Register.jsx"
import Watchlists from "./components/Watchlist.jsx"
import WatchlistDetail from "./components/WatchlistDetail.jsx"
import EditWatchlist from "./components/EditWatchlist.jsx"
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import {AuthProvider, useAuth} from "./components/AuthContext.jsx"
import "./contrast-fixes.css"

function NavigationContent() {
  const location = useLocation()
  const {isAuthenticated} = useAuth() 
  const excludeRoutes = ["/users/login", "/users/register"]
  const isExcludedRoute = excludeRoutes.includes(location.pathname)
  const shouldShowNavBar = !isExcludedRoute && isAuthenticated() 
  return (
    <>
      {shouldShowNavBar && <NavBar />}
      <Routes>
        <Route path = '/' element = {<Navigate to = "/login" replace />} />
        <Route path = '/login' element ={<Login />} />
        <Route path = '/register' element = {<Register />} />
        <Route path = '/mainpage' element = {
          <ProtectedRoute>
            <Main />
          </ProtectedRoute>
        } />
        <Route path = '/films/:filmId' element = {
          <ProtectedRoute>
            <Films />
          </ProtectedRoute>
        } />
        <Route path = '/users/:id' element ={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path = '/reviews/new/:filmId' element ={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        } />
        <Route path = '/reviews/edit/:reviewId' element ={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        } />
        <Route path = '/watchlists' element = {
          <ProtectedRoute>
            <Watchlists />
          </ProtectedRoute>
        } />
        <Route path = '/watchlists/:watchlistId' element = {
          <ProtectedRoute>
            <WatchlistDetail />
          </ProtectedRoute>
        } />
        <Route path = '/watchlists/edit/:watchlistId' element = {
          <ProtectedRoute>
            <EditWatchlist />
          </ProtectedRoute>
        } />
        <Route path = '/contact' element = {
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />
        <Route path = '/logout' element = {
          <ProtectedRoute>
            <Logout />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <NavigationContent />
      </AuthProvider>
    </BrowserRouter>
  )
}