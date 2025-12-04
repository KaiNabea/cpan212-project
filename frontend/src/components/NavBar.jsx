import {Link} from "react-router-dom"
import "./NavBar.css"

export default function NavBar() {
    return (
        <nav>
            <Link to = "/users/mainpage">
                Home
            </Link>
            <Link to = "/users/profile">
                Profile
            </Link>
            <Link to = "/users/reviews">
                Reviews
            </Link>
        </nav>
    )
}