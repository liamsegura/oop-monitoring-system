// *********************************
// Enabling Enviromental Variables
// *********************************
import dotenv from "dotenv"
dotenv.config()

// *********************************
// Import Dependencies
// *********************************
import express from "express"
import methodOverride from "method-override"
import cors from "cors"
import morgan from "morgan"
import MainController from "./controllers/MainController.js"
import APIController from "./controllers/APIController.js"
import mongoose from "mongoose"

// *********************************
// Global Variables & Controller Instantiation
// *********************************
const PORT = process.env.PORT || 3333
const MONGO_URI = process.env.MONGO_URI
const mainController = new MainController()
const apiController = new APIController()

// *********************************
// Mongodb connection
// *********************************

mongoose.connect(MONGO_URI)
mongoose.connection
.on("open", () => console.log("Connected to mongo"))
.on("close", () => console.log("disconnected from mongo"))
.on("error", (error) => console.log(error + "Error"))

// *********************************
// Model Objects
// *********************************

//Building

const buildingSchema = new mongoose.Schema({
    name: String,
    address: String,
    rooms: [{
        room: Number,
        details: {
            type: mongoose.Types.ObjectId, ref: "Resident", 
        }
    }],
    staff: Number,
    listed: { type: Boolean, default: true }
}, { timestamps: true })

//building model
const Building = mongoose.model('Building', buildingSchema)

//Resident 

const residentSchema = new mongoose.Schema({
    name: String,
    dob: String,
    contact: String,
    info: String,
    building: {
        type: mongoose.Types.ObjectId, ref: "Building",
    },
    roomnumber: Number,
    listed: Boolean,
    seen: Boolean,
}, {timestamps: true})

//Resident model
const Resident = mongoose.model('Resident', residentSchema)



// *********************************
// Creating Application Object
// *********************************
const app = express()

// *********************************
// Routers
// *********************************
const MainRoutes = express.Router()
const APIRoutes = express.Router()

// *********************************
// Middleware
// *********************************
// Global Middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(methodOverride("_method"))
app.use(express.static('public'))
app.use(morgan("tiny"))
//use models on all routes
app.use((req, res, next) => {
    req.models = {
        Building
    }
    next()
})
app.use("/", MainRoutes)
app.use("/api", APIRoutes)
// Router Specific Middleware
APIRoutes.use(cors())

// *********************************
// Routes that Render Pages with EJS
// *********************************
MainRoutes.get("/", mainController.index) // "/"
MainRoutes.get("/removedBuildings", mainController.removedBuildings)
MainRoutes.get("/newBuilding", mainController.newBuilding)
MainRoutes.post('/createBuilding', mainController.createBuilding)
MainRoutes.get('/todo/:id', mainController.show)
MainRoutes.put('/building/remove/:id', mainController.buildingRemove)
MainRoutes.delete('/building/:id', mainController.buildingDestroy)
MainRoutes.get("/completed", mainController.completedPage) // "/"

// *********************************
// API Routes that Return JSON
// *********************************
APIRoutes.get("/", apiController.example) //"/api"
APIRoutes.get("/todos", apiController.getTodos)


// mongoose.connection.on('open', async () => {
//     const circle = await Building.create({
//             name: "The Circle",
//             address: "Western Road",
//             rooms: [{
//                 room: 1, details:null
//             },{
//                 room: 2, details:null
//             },{
//                 room: 3, details:null
//             },{
//                 room: 4, details:null
//             },{
//                 room: 5, details:null
//             }],
//             staff: 2,
//         })
        
//         console.log(circle)
// })

// *********************************
// Server Listener
// *********************************
app.listen(PORT, () => console.log(`👂Listening on Port ${PORT}👂`))