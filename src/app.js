let  express = require('express')
let cors = require('cors')
require('dotenv').config()
let db = require('./config/dbConnection')
let userRouter = require('./routes/user')
let postRouter = require('./routes/post')
let helmet = require('helmet')

const PORT = process.env.PORT || 3001

const app = express()

app.use(express.json())
app.use(cors({origin:true}))
app.use(helmet())

app.use('/auth', userRouter)
app.use('/post',postRouter)

db.connect()

app.listen(PORT,()=>console.log('SERVER START AT PORT: '+PORT))