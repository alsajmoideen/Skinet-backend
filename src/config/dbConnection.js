require('dotenv').config()
let { MongoClient } = require('mongodb')

const mongoUrl = process.env.MONGO_DB_URL;
const dbName = process.env.DB_NAME


var url=mongoUrl
const client=new MongoClient(url)

let dbname

module.exports.connect=()=>{

    try{
        client.connect()
        console.log('Connection Successful')
        dbname = dbName
    }catch(e){
        console.log(e)
    }
}

module.exports.get=()=>{
    return client.db(dbname)
}

