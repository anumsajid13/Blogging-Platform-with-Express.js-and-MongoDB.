
//app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 9002;


// Middleware
app.use(express.json());


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/blogging', { useNewUrlParser: true });
const con = mongoose.connection;
con.on('open', () => {
    console.log('Connected to MongoDB');
});



const Router=require('./router/routes')
app.use('/',Router) 


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
