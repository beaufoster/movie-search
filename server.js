const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
require('dotenv').config()
const PORT = 8000


// Database Connection
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'sample_mflix',
    collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('Connected to database')
        db = client.db(dbName)
        collection = db.collection('movies')
    })

// Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// Methods
// app.get('/', (request, response) => {
//     response.sendFile(__dirname + '/index.html')
// })

app.get('/search', async(request, response) => {
    try{
        let result = await collection.aggregate([
            {
                "$search" : {
                    "autocomplete" : {
                        "query" : `${request.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits":2,
                            "prefixLength": 3,
                        }
                    }
                }
            }
        ]).toArray()
            // console.log(result)
            response.send(result)
    }   catch (error) {
        // console.log(result)
            response.status(500).send({message: error.message})
    }
})

app.get('/get/:id',  async (request, response) => {
    try {
        let result = await collection.findOne({
            "_id": ObjectId(request.params.id)
        })
        response.send(result)
    } catch (error){
        response.status(500).send({message: error.message})
    }
})


app.listen(process.env.PORT || PORT, () =>{
    console.log(`The server is running on port ${PORT}`)
})
