require("dotenv").config()
const cors = require("cors")
const express = require("express")
const cookieParser = require("cookie-parser")
const { filmRoutes } = require("./modules/films/film-routes")
const connectDB = require("./shared/middlewares/connect-db")
const { usersRoute } = require("./modules/users/user-routes")
const app = express()

const HOST = "localhost"
const PORT = 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(connectDB)

app.use(filmRoutes)
app.use("/users", usersRoute)

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