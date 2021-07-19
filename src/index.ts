import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import { serialize } from "v8";
import { Device } from "./entity/Device";
import { Employee } from "./entity/Employee";
import { Sample } from "./entity/Sample";
import { SaveWorker, Worker, WorkerManager } from "./worker";

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')

const port = 3100

const manager = new WorkerManager({
    exchange: 'message',
    exchange_type: 'topic',
    queue: 'queue_name'
})

createConnection().then(async connection => {
    // here you can start to work with your entities
    console.log("connected")

    const app = express();
    app.use(cors())
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(bodyParser.json());

    app.get("/", (req, res)=>{
        res.status(200).json("OK")
    })

    app.post("/save", async (req, res)=> {
        console.log(req.body.key)
        console.log(req.body.employee)
        manager.executeSaveWorker(req.body.key, req.body.employee)
        .then( (data) => {
            res.status(200).json(data)
        })
        .catch(err => console.error(err))
    })
    
    app.listen(port, err => {
        if(err) console.error(err);
        else console.log(`Server started on port ${port}`);
    });
})
.catch(error => console.log(error));

// createConnection().then(async db => {
//     // here you can start to work with your entities
//     console.log("connected")
    
//     let w = new WorkerManager({
//         topic: '*',
//         exchange: 'message',
//         exchange_type: 'topic',
//         queue: 'queue_name'
//     })
//     console.log(w)
// })
// .catch(error => console.error(error));