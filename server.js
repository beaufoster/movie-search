const express = require('express')
const app = express()
const PORT = 8000
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
require('dotenv').config()

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
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/search', async(request, response) => {
    try{
        let results = await collection.aggregate(
            {
                "$Search" : {
                    "autocomplete" : {
                        "query" : `${request.query.query}`,
                        "path": "title",
                        "fuzzy": {
                            "maxEdits":2,
                            "prefixLength": 3,
                        }
                    }
                }
            }).toArray()
            response.send(result)
    }   catch (error) {
            response.status(500).send({message: error.message})
    }
})

app.get('/get/:id',  async(request, response) => {
    try {
        let result = await collection.findOne({
            "_id": ObjectId(request.params.id)
        })
        response.send(result)
    } catch (error){
        response.status().send({message: error.message})
    }
})


app.listen(process.env.PORT || PORT, () =>{
    console.log(`The server is running on port ${PORT}`)
})