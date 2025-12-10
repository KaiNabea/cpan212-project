require("dotenv").config()
const cors = require("cors")
const express = require("express")
const cookieParser = require("cookie-parser")
const connectDB = require("./shared/middlewares/connect-db")
const { filmRoutes } = require("./modules/films/film-routes")
const { usersRoute } = require("./modules/users/user-routes")
const { reviewRoutes } = require("./modules/reviews/review-routes")
const { watchlistRoutes } = require("./modules/watchlist/watchlist-routes")
const app = express()

const HOST = "0.0.0.0"
const PORT = 3000

app.use(cors({
  origin: "http://cpan212-project.vercel.app/",
  credentials: true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(connectDB)

app.use("/", filmRoutes)
app.use("/users", usersRoute)
app.use("/reviews", reviewRoutes)
app.use("/watchlists", watchlistRoutes)

app.use((error, req, res, next) => {
    console.log(error)
    res.status(500).send("Oops! Internal server error.")
})

app.use((req, res, next) => {
  res.status(404).send(`404! ${req.method} ${req.path} Not Found.`);
})

app.listen(PORT, HOST, (error) => {
    if (error) console.log(error.message)
    else console.log(`Server running on http://${HOST}:${PORT}`)
})