const http = require('http');
const express = require('express');
const Light = require('./mongodb-model');
const mqtt = require('mqtt');
// const mongoose = require('mongoose');
// var LoadBalancer = 'NewNewNeeeeeeewBalancer-285813869.us-east-1.elb.amazonaws.com';

var LoadBalancer = '3.83.126.58'; // sending to the server AWS instance
const options = {
  hostname: LoadBalancer,
  port: 3000,
  path: '/data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'}
};


const mqttBrokerUrl = 'mqtt://broker.hivemq.com:1883'; 
// const mongoDbUrl = 'mongodb+srv://user:hello@sit314.ucqtajh.mongodb.net/?retryWrites=true&w=majority'; 


const client = mqtt.connect(mqttBrokerUrl);

client.subscribe('Lights');

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('lights/#'); 
});


client.on('message', (topic, message) => {
    const lightData = JSON.parse(message);
    const light = new Light(lightData);


    const req = http.request(options, (res) => {
        let responseData = '';
        console.log(`Data sent and response received -
             Status code: ${res.statusCode}`);
      
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          console.log('Sent data successfully', responseData);
        });
      });
    
      req.on('error', error => {
        console.error('Error sending data:', error);
      });
    
      req.write(JSON.stringify(light));
      req.end();

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
