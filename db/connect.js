const mysql = require('mysql');
const mongoose = require('mongoose');

const connectDB = (url) => {
    return mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb'
  });

//   connection.connect(error => {
//     if (error) throw error;
//     console.log('Connected to MySQL database!');
//   });


mongoose.set('strictQuery', false)




module.exports = connectDB;