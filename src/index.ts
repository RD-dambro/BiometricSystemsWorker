import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import { Device } from "./entity/Device";
import { Sample } from "./entity/Sample";
import { Worker, WorkerManager } from "./worker";


createConnection().then(async db => {
    // here you can start to work with your entities
    console.log("connected")
    
    let w = new WorkerManager({
        topic: '*',
        exchange: 'message',
        exchange_type: 'topic',
        queue: 'queue_name'
    })
    console.log(w)
})
.catch(error => console.error(error));