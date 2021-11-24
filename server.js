const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = express()
const saltrounds = 10

app.use(bodyparser.urlencoded({ extended: false}))
app.use(bodyparser.json())

mongoose.connect("mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userschema = new mongoose.Schema({
    username: String,
    password: String,
    joined: { type: Date, default: Date.now()}
})
const User = mongoose.model("user", userschema)

app.get('/', (req,res) => {
    res.json('this is an get request')
})

app.post('/register', async (req,res) => {
    console.log(req.body)
    try {
        const hashedpwd = await bcrypt.hash(req.body.password, saltrounds)
        const result = await User.create({
            username: req.body.username,
            password: hashedpwd
        })
        res.json({result})
    } catch (error) {
        console.log(error)
        res.status(500).json('internal server error occured')
    }
})

app.post('/login', async (req,res) => {
    try {
        const user = await User.findOne({ username: req.body.username })
        console.log(user)
        if (user) {
            const cmp = await bcrypt.compare(req.body.password, user.password)
            if (cmp) {
                res.json('auth successful')
            } else {
                res.json('username or password is invalid')
            }
        } else {
            res.json('username or password is invalid')
        }
    } catch (error) {
        console.log(error)
        res.status(500).json('internal server error occured')
    }
})

app.listen(3000,(req,res) => {
    console.log('server is running on port 3000')
})