// File: app.js
const express = require('express');
const bodyParser = require('body-parser');
const Controller = require('./controllers/controllers'); 
const { UpdateUserProfile } = require('./models/models');

const app = express();
app.use(express.json()); 

app.use(bodyParser.json());

// Define the registration route
app.post('/register', Controller.handleRegistration);
app.post('/login',Controller.login);
app.post('/profile',Controller.UserProfile);
app.put('/update',Controller.UpdateUserProfile);
app.post('/createpost',Controller.postCreation);
app.post('/connect',Controller.createConnection)
app.post('/joblist',Controller.createjoblist)
app.post('/resume',Controller.ResumesUpload)
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
