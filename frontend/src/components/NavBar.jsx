import { Link } from "react-router-dom"
import { useAuth } from "./AuthContext"
import "./NavBar.css"

export default function NavBar() {
    const { user } = useAuth()
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="navbar-inner">
                    <div className="navbar-link">
                        <Link to="/mainpage">
                            Home
                        </Link>
                    </div>
                    <div className="navbar-link">
                        <Link to="/watchlists">
                            Watchlists
                        </Link>
                    </div>
                    <div className="navbar-link">
                        {user && (
                            <Link to={`/users/${user._id}`}>
                                Profile
                            </Link>
                        )}
                    </div>
                    <div className="navbar-link">
                        <Link to="/logout">
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}