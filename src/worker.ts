import {createConnection, getConnectionOptions, getRepository} from "typeorm";
import { Sample } from "./entity/Sample";

import { Consumer, ConsumerOptions, ConnectionOptions, Producer } from './rabbit'

var fs = require('fs')


export class Worker extends Consumer{
    state: string
    save_cnt = 0
    save = async (f) => {
        console.log(`Saving face ${f.length} with options ${this.ops}`)
        
        
        // save file in the volume
        // console.log(f.type)
        // console.log(`${__dirname}/../../volume/${item.id}.jpeg`)
        let b = Buffer.from(f, 'base64')
        // fs.writeFile(`${__dirname}/../../volume/${this.save_cnt++}.jpeg`, b, {encoding: 'base64'} , (err) => {
        //     if (err) {
        //         console.error(err)
        //     }
        //     else {
        //         if (this.save_cnt > 10){
        //             this.state = undefined
        //             this.save_cnt = 0
        //         }
        //     }

        // })
        // save sample in db 
        // const item = await getRepository(Sample).create({name:'asdf', description:'asdf' , data: 'asdf'});
        this.ops['data'] = b
        this.ops['name'] = `${this.save_cnt++}.jpeg`
        const item = await getRepository(Sample).create(this.ops);
        const res = await getRepository(Sample).save(item).then(() => this.state = this.save_cnt > 10? undefined:this.state);
    }
    
    actions = {
        'save' : this.save
    }
    
    face = (f) => {
        console.log(`face: ${f.length}`)
        
        if(this.state in this.actions) this.actions[this.state](f)
    }
    
    ops = {}

    parseOptions = (op) => {
        op.forEach( s => {
            let [k, v] = s.split(":")
            this.ops[k] = v  
        })
    }
    action = (m: string) => {
        console.log(`action: ${m}, ${typeof(m)}`)
        let a = m.toString().split(" ")[0]
        let op = m.toString().split(" ").slice(1)
        // console.log(`a: ${a}, op: ${op}`);
        
        if(a in this.actions) {
            this.state = a
            this.parseOptions(op)
        }
        else this.state = undefined
    }

    d = {
        'uid1.face' : this.face,
        'uid1.action' : this.action
    }

    callback = (msg) => {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString().length);
        // this.d[msg.fields.routingKey](msg.content)
    }
    constructor(c: ConsumerOptions, callback?){
        super(c)
        console.log("worker init")
        this.callback = callback ? callback : this.callback
    }

}

export interface SaveOptions extends ConnectionOptions{
    topic: string
    employee: any
}

interface ISample {
    id?: number,
    name: string,
    description: string,
    data: Buffer
}

// wait for {emoployee} messages on {topic}.face and corresponding sample 
export class SaveWorker extends Consumer {
    employee:any
    ops = {}
    save_cnt = 0
    done: boolean
    items: ISample[]

    constructor(c: SaveOptions){
        super({...c, keys: [`${c.topic}.face`]})
        this.employee = c.employee
        console.log("protec worker init")
    }

    onSaveDone = () => {
        return new Promise<ISample[]>((resolve, reject)=> {
            if(this.done) resolve(this.items)
            else reject("error")
        })
    }
    save = async (f) => {
        if(!this.done){
            let b = Buffer.from(f, 'base64')
            this.ops['data'] = b
            this.ops['name'] = `${this.save_cnt++}.jpeg`
            this.ops['employee'] = this.employee
            const item = await getRepository(Sample).create(this.ops);
            const res = await getRepository(Sample).save(item).then(() => {
                this.items.push(item as ISample)
                this.done = (this.save_cnt == 20)
            });
        }
    }

    callback = (msg) => {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString().length);
        this.save(msg.content)
        // this.d[msg.fields.routingKey](msg.content)
    }
}


export class WorkerManager{
    private connectionOptions: ConnectionOptions
    private worker = {}
    // private producer: Producer

    executeSaveWorker = (topic: string, employee: any) => {
        let w = new SaveWorker({...this.connectionOptions, topic: topic, employee: employee})
        let p = new Producer({...this.connectionOptions, key:`${topic}.state`})
        p.onChannelUp()
        .then(res => {
            console.log("publishing...")
            p.publish("start")
        })
        .catch(err => console.error(err))
        
        return w.onSaveDone()
    }
    constructor(c: ConnectionOptions){
        this.connectionOptions = c
        console.log("detec worker init")
    }
}
// export interface ManagerOptions extends ConnectionOptions {
    // topic: string
// }
// wait for messsages on *.action, parse action parameters and start the corresponding worker
// export class WorkerManager extends Consumer {
    
//     constructor(c: ManagerOptions){
//         super({...c, keys: [`${c.topic}.action`]})
//         console.log("detec worker init")
//     }

//     callback = (msg) => {
//         console.log(" [x] %s:'%s'", msg.fields.routingKey.split('.')[0], msg.content.toString());
//         // parse request
        
//         // spawn worker
//     }
// }