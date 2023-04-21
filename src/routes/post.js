var express = require('express')
var db = require('../config/dbConnection')
var collection = require('../config/collection')
var objID = require('mongodb')
var { verifyToken } = require('./user')

const router = express.Router()

// Fetch all post from DB
router.get("/", async (req, res) => {
    try {
        const postList = await db.get().collection(collection.POST_COLLECTION).find().toArray()
        res.json(postList)
    } catch (error) {
        res.json(error)
    }
})

// Fetch post based on postID
router.get("/postview/:postID", async (req, res) => {

    let postId = req.params.postID
    postId = new objID.ObjectId(postId)

    try {
        const post = await db.get().collection(collection.POST_COLLECTION).findOne({_id:postId})
        res.json(post)
    } catch (error) {
        res.json(error)
    }
})

// Creating new post to DB
router.post("/project/:userID",async (req, res) => {
    const { title, domain, discription, payment } = req.body
    
    let userId = req.params.userID
    userId = new objID.ObjectId(userId)
    let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId})

    try {
        await db.get().collection(collection.POST_COLLECTION).insertOne({
            title: title,
            domain: domain,
            discription: discription,
            payment: payment,
            postedUser: user.name,
            postedUserId:userId,
            appliedList:[]
        })
        res.json({msg:"post create successfuly..!",status:true})
    } catch (error) {
        console.log(error)
        res.json({error,status:false})
    }
})

// Apply list update
router.put("/",async (req, res) => {
    var userId = req.body.userID
    userId = new objID.ObjectId(userId)
    var postId = req.body.postID
    postId = new objID.ObjectId(postId)

    try {

        const post = await db.get().collection(collection.POST_COLLECTION).findOne({ _id: postId })
        await db.get().collection(collection.USER_COLLECTION).updateOne(
            { _id: userId },
            { $push: { workList: post._id } }
        )
        await db.get().collection(collection.POST_COLLECTION).updateOne(
            { _id: postId },
            { $push: { appliedList: userId } }
        )
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId })
        res.json({ workList: user?.workList })
    } catch (error) {
        console.log(error)
    }
})
/*
router.get("/saverRecipes/ids/:userID", async (req, res) => {
    var userId = req.params.userID
    userId = new objID.ObjectId(userId)

    try {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId })
        res.json({ savedRecipes: user?.savedRecipes })
    } catch (error) {
        res.json(error)
    }
})
*/
router.get("/worklist/:userID", async (req, res) => {
    var userId = req.params.userID
    userId = new objID.ObjectId(userId)

    try {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId })
        const workList = await db.get().collection(collection.POST_COLLECTION).find({
            _id: { $in: user.workList }
        }).toArray()
        res.json({ workList })
    } catch (error) {
        res.json(error)
    }
})

module.exports = router