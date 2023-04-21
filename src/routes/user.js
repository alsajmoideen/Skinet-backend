require('dotenv').config()

let express = require("express")
let jwt = require('jsonwebtoken')
let bcrypt = require('bcrypt')

let db = require('../config/dbConnection')
let collection = require('../config/collection')

let objID = require('mongodb')

let mailer = require('../sendEmail/sendEmail')
const emailValidator = require('deep-email-validator');

const jwtToken = process.env.JWT_TOKEN

let router = express.Router()

// Check the email is valide
async function isEmailValid(email) {
    return emailValidator.validate(email)
}

// Get user

router.get("/user/:userID", async (req, res) => {
    var userID = req.params.userID
    userID = new objID.ObjectId(userID)

    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userID })

    res.json(user)
})

// Register part of api

router.post("/register", async (req, res) => {
    const { email, password, } = req.body
    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: email })

    if (user) {
        return res.json({ message: "user already exists!", valid:false, userExist: true })
    } else {
        const hashPassword = await bcrypt.hash(password, 15)
        db.get().collection(collection.USER_COLLECTION).insertOne(
            {
                email: email,
                password: hashPassword,
                icon: '',
                name: '',
                domain: '',
                bio: '',
                portfolioLink: '',
                workList: [],
                postList: [],
                savedPost: [],
                verify: false
            })
        mailer.sendEmail(email)
        return res.json({
            message: "Verification is send to Your registered Email",
            valid:true
        })
    }


})

// Gmail verify

router.get("/verify/:token/:email", async (req, res) => {
    const mailToken = req.params.token
    const email = req.params.email

    jwt.verify(mailToken, process.env.JWT_EMAIL_TOKEN, async (err) => {
        if (err) {
            console.log(err)
        } else {
            var myquery = { email: email };
            var newvalues = { $set: { verify: true } };

            await db.get().collection(collection.USER_COLLECTION).updateOne(myquery, newvalues, (err, result) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(result)
                }
            })
            res.redirect(`${process.env.WEBSITE_URL}/auth/verify`)
        }
    })
})


// Login part of api

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    const user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: email })

    if (!user) {
        res.json({ message: "User don't exist!", valid: false })
    } else {
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.json({ message: "Password is wrong!", validPassword: false })
        } else {
            if (user.verify) {
                const token = jwt.sign({ id: user._id }, jwtToken, { expiresIn: '1h' })
                res.json({ token, userID: user._id, validPassword: true, name: user.name })
            } else {
                mailer.sendEmail(email)
                res.json({ message: "Check Your Registered Email For Verify..!", verify: user.verify, valid })
            }
        }
    }

})

router.put("/profile/:userID", async (req, res) => {
    var userID = req.params.userID
    userID = new objID.ObjectId(userID)

    const { icon, name, domain, bio, link } = req.body

    try {
        await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: userID },
            { $set: { icon: icon, name: name, domain: domain, bio: bio, portfolioLink: link } }
        )
        res.json({ message: "Profile Created", status: true })
    } catch (error) {
        console.log(error)
    }
})

module.exports = router

// Token verification part

module.exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization
    if (token) {
        jwt.verify(token, jwtToken, (err) => {
            if (err) {
                return res.sendStatus(403)
            } else {
                next()
            }
        })
    } else {
        res.sendStatus(401)
    }
}


