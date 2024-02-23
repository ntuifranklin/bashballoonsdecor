// Description: This file contains the MySQLDBConnector class. This class is responsible for creating a connection to the MySQL database and executing queries.

require('dotenv').config();
const mysql2 = require('mysql2');

const defaultMySQLDBConnectorConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_UPGRADED_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 20, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 360000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}; 

exports.defaultMySQLDBConnectorConfig = defaultMySQLDBConnectorConfig;


class MySQLDBConnector{

    static pool = null;
    static connection = null ;
    static config = defaultMySQLDBConnectorConfig;
    constructor(){
        this.config = MySQLDBConnector.defaultMySQLDBConnectorConfig;
        MySQLDBConnector.pool = getPool();

    }

    /** Singleton design pattern */
    static async getPool(){
        if (MySQLDBConnector.pool === null){
            MySQLDBConnector.pool = mysql2.createPool(this.config);
        } ;
        return MySQLDBConnector.pool;
    }

    static async getConnection() {
        return await MySQLDBConnector.getPool().getConnection();
    }

    static async execute(query, params=[]){
        //console.log(`Executing query: ${query} with params: ${params}`);
        var params = params;
        return new Promise(async(resolve, reject) => {
            
            const pool = await MySQLDBConnector.getPool();
            
            
            if (params !== null && params.length != 0){ 
                    
                await pool.execute(query, params, (err, rows, fields) => {
                    //console.log(`Executing query: ${query} with params: ${params}`);
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        //conn.release();
                        resolve(rows);
                    }

                });
            } else {
                await pool.execute(query, (err, rows, fields) => {
                    if (err) {
                        console.log(`error in MySQLDBConnector.execute: ${err}`);
                        reject(err);
                    } else {
                        //conn.release();
                        resolve(rows);
                    }

                });
            }
        });
    } ;

    static async startTransaction(){
        return new Promise(async(resolve, reject) => {
            const conn = MySQLDBConnector.getConnection();
            await conn.execute('START TRANSACTION',(err) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(conn);
                }
            });
        });
    } ;

    static async rollbackTransaction(){ 
        return new Promise(async(resolve, reject) => {
            const conn = MySQLDBConnector.getConnection();
            await conn.execute('ROLLBACK',(err) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(conn);
                }
            });
        });
    }
    
    static async endTransaction(){
        return new Promise(async(resolve, reject) => {
            const conn = MySQLDBConnector.getConnection();
            await conn.execute('COMMIT',(err) => {
                if (err) {
                    throw new Error(err);
                } else {
                    resolve(conn);
                }
            });
        });
    }

} ;

exports.MySQLDBConnector = MySQLDBConnector;