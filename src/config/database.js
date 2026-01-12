const mongoose = require('mongoose');

const connectDB = async () =>{
    await mongoose.connect(
        "mongodb+srv://Awow:FQbCxWklGDMYdkDk@nodejs.b6yjuyg.mongodb.net/devTinder"
    );
}
module.exports = connectDB;
