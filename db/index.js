const mysql = require('mysql');
const config = require('../config');

let pool;
module.exports = {
    getPool: ()=>{
        if (pool) return pool;
        pool = mysql.createPool({
            host: config.get('hostDB'),
            user: config.get('userDB'),
            password: config.get('passwordDB'),
            database: config.get('database')
        });
        return pool;
    }
};