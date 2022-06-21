const express = require("express")
const session = require("express-session")

const cors = require("cors")
const app = express()
const port = process.env.PORT || 4000
global.__prod__ = process.env.NODE_ENV == "production"

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
  name: "qid",
  saveUninitialized: false,
  secret: "hola jeje",
  resave: false,
  cookie: {
    //secure: global.__prod__,
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // dias years
    //httpOnly: true,
    sameSite: "lax"
  }
}))

//routes
app.use("/", require("./routes/auth"))

app.listen(port, () => {
  console.log(`server (${global.__prod__ ? 'prod' : 'dev'}) running on port ${port}...`)
})
