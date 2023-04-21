const nodemailer = require('nodemailer')
require('dotenv').config()
const jwt = require('jsonwebtoken')


let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: process.env.SERVICE,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS
    }
})

module.exports.sendEmail = (email) => {
    const token = jwt.sign({
        data: 'Token Data'
    }, process.env.JWT_EMAIL_TOKEN, { expiresIn: '10m' }
    );

    const mailConfig = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: 'Email Verification',
        html: `<h3>Hi! There, You have recently visited our website and entered your email.
        Please follow the given link to verify your email</h3>
        <a href=${process.env.BASE_URL}${token}/${email}> Press Here To Verify...!</a>
        <h2>Welcome to our Family :)</h2>`
    }

    transporter.sendMail(mailConfig, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Email Sent Successfully');
        }
    })
}