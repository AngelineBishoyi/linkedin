const mysql = require('mysql2/promise');
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "linkedin",
    waitForConnections: true,
 
});
db.getConnection()
    .then(() => console.log("Successfully connected to the database 'linkedin'"))
    .catch(err => {
        console.error("Error connecting to the database:", err.message);
        process.exit(1); 
    });

module.exports = db; 


