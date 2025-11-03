const express = require("express")
const app = express()

const HOST = "localhost"
const PORT = 3000

app.use(express.json())

app.listen(PORT, HOST, (error) => {
    if (error) console.log(error.message)
    else console.log(`Server running on http://${HOST}:${PORT}`)
})