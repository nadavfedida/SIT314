const mqtt = require('mqtt');
const mongoose = require('mongoose');
const Light = require('./mongodb-model');


const mqttBrokerUrl = 'mqtt://broker.hivemq.com:1883'; 
const mongoDbUrl = 'mongodb+srv://user:hello@sit314.ucqtajh.mongodb.net/?retryWrites=true&w=majority'; 


const client = mqtt.connect(mqttBrokerUrl);

client.subscribe('Lights');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('lights/#'); 
});


client.on('message', (topic, message) => {
    const lightData = JSON.parse(message);
    const light = new Light(lightData);

    
    // Store data in MongoDB
    mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            return light.save();
        })
        .then(() => {
            console.log('Light data saved to MongoDB');
        })
        .catch((err) => {
            console.error('MongoDB error:', err);
        });
});

client.on('error', (error) => {
    console.error('MQTT error:', error);
    client.end();
});

process.on('SIGINT', () => {
    console.log('\x1b[31m','Disconnecting from MQTT broker');
    client.end();
    process.exit() 
});


//  currently on 

//  NEW3 image #1