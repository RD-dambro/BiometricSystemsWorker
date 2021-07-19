import { rejects } from "assert";

require('dotenv').config()
var amqp = require('amqplib/callback_api');

const username = process.env.rabbitUsername
const password = process.env.rabbitPassword
const hostname = `${process.env.rabbitHost}:${process.env.rabbitPort}`
const virtual = process.env.rabbitVirtualHost

const rabbitUrl = `amqp://${username}:${password}@${hostname}/${virtual}`;

export interface ConnectionOptions{
    exchange: string,
    exchange_type: string,
    queue: string,
}

export interface ConsumerOptions extends ConnectionOptions {
    topic: string, 
    keys: string[]
}

interface ProducerOptions extends ConnectionOptions {
    key: string
}

class Rabbit {
    exchange = 'message'
    exchange_type = 'topic'
    queue = 'queue_name'
    setOptions: any

    getChannel = (err, connection) => {
        if (err) {
            throw err;
        }
        console.log("connection open")
        connection.createChannel(this.setOptions)
    }
    getConnection = () =>{
        console.log("connetting...")
        amqp.connect(rabbitUrl, this.getChannel)
    }

    constructor(o: ConnectionOptions){
        this.exchange = o.exchange
        this.exchange_type = o.exchange_type
        this.queue = o.queue
        this.getConnection()
    }

}

export class Producer extends Rabbit{
    topic = 'uid1'
    key = 'uid1.state'
    up: boolean = false
    channel: any = undefined
    
    onChannelUp = async () => {
        return new Promise<boolean>((resolve, reject) => {
            if(this.up) resolve(true)
            else reject("error on channel up")
        })}

    publish = (msg) => {
        try {            
            this.channel.publish(this.exchange, this.key, Buffer.from(msg))
        } catch (error) {
            this.getConnection()
            this.channel.publish(this.exchange, this.key, Buffer.from(msg))
        }
    }
    setOptions = (err, channel) => {
        if (err) {
            throw err;
        }
        console.log('channel open')
        channel.assertExchange(this.exchange, this.exchange_type, {
            durable: false
        });

        this.channel = channel
        this.up = true
    }
    constructor(p:ProducerOptions){
        super({
            exchange : p.exchange,
            exchange_type : p.exchange_type,
            queue : p.queue
        });        
        this.key = p.key
    }
}

export class Consumer extends Rabbit {
    topic = 'uid1'
    exchange = 'message'
    exchange_type = 'topic'
    queue = 'queue_name'
    keys = ['uid1.face', 'uid1.action']

    callback: any
    
    setOptions = (err, channel) => {
        if (err) {
            throw err;
        }
        console.log("channel open")
        channel.assertExchange(this.exchange, this.exchange_type, {
            durable: false
        });

        channel.assertQueue(this.queue, {exclusive: false, durable: false}, (err0, q) => {
            if (err0) {
                throw err0;
            }
            console.log('queue defined');
      
            for(let key of this.keys) {
              channel.bindQueue(this.queue, this.exchange, key);
              console.log(`binded ${key}`)
            }
            console.log(`consuming on ${this.queue}`)
            channel.consume(this.queue, this.callback, {noAck: true});
        });
    }
    
    constructor(c:ConsumerOptions){
        super({
            exchange : c.exchange,
            exchange_type : c.exchange_type,
            queue : c.queue
        })
        this.topic = c.topic
        this.keys = c.keys
    }
}