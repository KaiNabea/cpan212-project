import {useState, useEffect} from "react"

export default function Films() {
    const [films, setFilms] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        fetch("/films")
            .then(res => res.json())
            .then(data => {
                console.log("Fetched data:", data)
                setFilms(data.data || data)
                setLoading(false)
            })
            .catch(err => console.error("Error:", err))
    }, [])
    if (loading) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    return (
        <div className="App">
            <h1>
                Film Collection
            </h1>
            <div className="films-grid">
                {Array.isArray(films) && films.map(film => (
                    <div key={film._id} className="film-card">
                        <h2>
                            {film.title}
                        </h2>
                        <p>
                            Genre: {film.genre}
                        </p>
                        <p>
                            Release Date: {film.release_date}
                        </p>
                        <p>
                            Rating: {film.rating}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}