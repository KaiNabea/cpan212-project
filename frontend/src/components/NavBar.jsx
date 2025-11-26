import {Link} from "react-router-dom"

export default function NavBar() {
    return (
        <nav>
            <Link to = "/">
                Home
            </Link>
            <Link to = "/Profile">
                Profile
            </Link>
            <Link to = "/Reviews">
                Reviews
            </Link>
            <Link to = "/Contact">
                Contact
            </Link>
        </nav>
    )
}