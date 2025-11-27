import React, {useState, useEffect, createContext} from "react"
import {useNavigate} from "react-router-dom"

const styles = {
    title: {
        fontSize: "24px",
        font: "bold"
    }
}

export default function Website(page) {
    const [search, setSearch] = useState("")
    const handleSearch = (e) => {
        e.preventDefault()
        console.log("Searching...")
    }
    return (
        <div>
            <h1 style = {styles.title}>
                THE BACKLOG - It's Not Work, It's Entertainment
            </h1>
            <form onSubmit = {handleSearch}>
                <input
                    type = "text"
                    placeholder = "Search..."
                    value = {search}
                    onChange = {(e) => setSearch(e.target.value)}
                />
            </form>
        </div>
    )
}

