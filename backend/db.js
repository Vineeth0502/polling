const mongoose = require('mongoose');

const dbURI = "mongodb+srv://mdrohitreddy:mdrohitreddy@cluster0.bzga5vf.mongodb.net/teachers";

const connectToDB = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
};

module.exports = connectToDB;

