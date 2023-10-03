const mqtt = require('mqtt');
const Light = require('./models/lights');
const lightsCount = parseInt(process.argv[2]);
const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

if (isNaN(lightsCount)) {
    console.error('Please provide a valid number of lights.');
    process.exit(1);
}
// Generate a timestamp
const generateTimestamp = () => {
    return new Date();
    };
client.on('connect', () => {
    console.log('Connected to MQTT broker');

    for (let i = 0; i < lightsCount; i++) {
        //  Create random starting data per light
        const locations = ["HOME", "OFFICE1", "OFFICE2", "OFFICE3"];
        const randomIndex = Math.floor(Math.random() * locations.length);
        const randomNumber = Math.random();
        var Brightness = Math.floor(Math.random() * (100 - 0) + 0);
        var Status = randomNumber < 0.5 ? "ON" : "OFF";
        var Locations = locations[randomIndex];
        var timestamp = generateTimestamp();


        var newLight = new Light({
            _id: i,
            location: Locations,
            brightness: Brightness,
            status: Status,
            time : timestamp
        })
        const topic = `Lights`;
        // console.log(JSON.stringify(newLight))
        client.publish(topic, JSON.stringify(newLight));
    }

    console.log(`Published ${lightsCount} lights.`);
    client.end();
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