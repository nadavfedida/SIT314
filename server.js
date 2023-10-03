// WILL BE ON AWS IMAGES THAT WILL GET 
// DISTRIBUTED IMFORMATION FROM THE LOAD BALANCER


const mongoose = require('mongoose');
const express = require('express');
const Light = require('./models/lights');
const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect('mongodb://52.91.72.250:27017/lights'); // 

app.get('/data', (req, res) => {
    console.log(res, res)
})
app.post('/data', (req, res) => {
    const JSONdata = req.body;

    const newData = new Light(JSONdata);

    newData.save()
        .then(savedData => {
        console.log('Saved data to database:\n', savedData);
        res.send('Data reveived');
        })
        .catch(error => {
            console.error('Error entering the data:\n', error);
            res.status(500).send('Data not saved');
        });
});

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});



//  currently on 

//  NEW3 image #2