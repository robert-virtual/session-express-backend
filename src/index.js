const { PrismaClient } = require("@prisma/client")
const { hash, verify } = require("argon2")
const express = require("express")
const { upload } = require("./config/multer")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 4000
global.__prod__ = process.env.NODE_ENV == "production"
const prisma = new PrismaClient()

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.post('/register', upload.array("profile"), async (req, res) => {
  try {
    req.body.password = await hash(req.body.password)
    const user = await prisma.users.create({
      data: req.body
    })
    res.cookie("qid", user.id, {
      httpOnly: true,
      domain: req.get("host"),
      expires: new Date(Date.now() + 1000 * 60 * 2),
      maxAge: 1000 * 60 * 2,
      secure: global.__prod__
    })
    res.json({ msg: "cookie set" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})
app.get("/private", async (req, res) => {
  const cookies = req.get("cookie").split("=")
  const id = cookies[1]
  const user = await prisma.users.findUnique({ where: { id } })
  if (!user) return res.status(401).json({ msg: "Not authorized" })
  res.json({ msg: "private content", user })
})
app.post('/login', async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        email: req.body.email
      }
    })
    if (!user) return res.status(401).json({ msg: "bad credentials" })
    let valid = await verify(user.password, req.body.password)
    if (!valid) return res.status(401).json({ msg: "bad credentials" })
    res.cookie("qid", user.id, {
      httpOnly: true,
      domain: req.get("host"),
      expires: new Date(Date.now() + 1000 * 60 * 2),
      maxAge: 1000 * 60 * 2,
      secure: global.__prod__
    })
    res.json({ msg: "cookie set" })
  } catch (err) {
    res.status(500).json({ msg: err.message })
  }
})

app.post("/another", (req, res) => {
  res.cookie("another", "Hola", {
    httpOnly: true,
    domain: req.get("host"),
    expires: new Date(Date.now() + 1000 * 60 * 2),
    maxAge: 1000 * 60 * 2,
    secure: global.__prod__
  })
  res.json({ msg: "another cookie settled" })
})

app.delete("/logout", (_req, res) => {
  res.cookie("qid", null)
  res.json({ msg: "logged out" })
})

app.listen(port, () => {
  console.log(`server (${global.__prod__ ? 'prod' : 'dev'}) running on port ${port}...`)
})
