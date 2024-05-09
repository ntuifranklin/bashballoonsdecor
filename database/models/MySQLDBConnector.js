// Description: This file contains the MySQLDBConnector class. This class is responsible for creating a connection to the MySQL database and executing queries.

require('dotenv').config();
const mysql2 = require('mysql2');

const {isTestEnvironment} = require('../../utilities/functions');

const TEST_MARIADB_CONFIG = {
    host: process.env.DATABASE_HOST,
    user: process.env.UPGRADED_DATABASE_USER,
    password: process.env.UPGRADED_DATABASE_PASSWORD,
    database: process.env.TEST_DATABASE_UPGRADED_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 20, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 360000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}; 

exports.TEST_MARIADB_CONFIG = TEST_MARIADB_CONFIG;

const PROD_MARIADB_CONFIG = {
    host: process.env.DATABASE_HOST,
    user: process.env.UPGRADED_DATABASE_USER,
    password: process.env.UPGRADED_DATABASE_PASSWORD,
    database: process.env.PROD_DATABASE_UPGRADED_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    maxIdle: 20, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 360000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}; 

exports.PROD_MARIADB_CONFIG = PROD_MARIADB_CONFIG;

var ENV_DB_CONFIG = {};

const thisEnv = isTestEnvironment(__dirname);
//console.log(`Got environment testing is ${thisEnv}`);
if (thisEnv == true )
    ENV_DB_CONFIG = TEST_MARIADB_CONFIG;
else if (thisEnv == false )
    ENV_DB_CONFIG = PROD_MARIADB_CONFIG ;
else 
    throw new Error("Could not detect environment");


const defaultMySQLDBConnectorConfig = ENV_DB_CONFIG ;
exports.defaultMySQLDBConnectorConfig = defaultMySQLDBConnectorConfig;

class MySQLDBConnector{

    static pool = null;
    static connection = null ;
    static config = ENV_DB_CONFIG;
    constructor(){

        this.config = ENV_DB_CONFIG;        
        MySQLDBConnector.pool = MySQLDBConnector.getPool();

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
        /* 
        console.log(`\n\t
        Executing query: \n\t ${query} \n\t with params: ${params}
        \n\t with database parameters : ${JSON.stringify(MySQLDBConnector.config)}
        `);
        */
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

    
    /** 
     * This method is used to execute multiple queries in a transaction mode.
     * @param {Array} queries - An array of queries to be executed.
     * @param {Array} multiple_params - An array of arrays of parameters to be used in the queries.
    */
    static async executeInTransactionMode(queries=[], multiple_params=[]){
        //console.log(`Executing query: ${query} with params: ${params}`);
        var multiple_params = multiple_params;
        var queries = queries;
        return new Promise(async(resolve, reject) => {
                        
            if (multiple_params !== null && multiple_params.length != 0 && queries != null && queries.length == multiple_params.length){ 
                var i = 0 ;
               try {
                const pool = await MySQLDBConnector.startTransaction();
                    
                    while (i < multiple_params.length){
                        var query = queries[i];
                        var params = multiple_params[i];
                        i++;
                        //console.log(`Executing query: ${query} with params: ${params}`);
                        
                        await pool.execute(query, params, (err, rows, fields) => {
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                            } 
                        });
                    } ;
                    const endTransaction = await MySQLDBConnector.endTransaction(pool);
                    resolve('successfully all queries executed in transaction mode.');
               } catch (err) {
                     throw new Error(err);
               }
                
            } else {
                reject(new Error('Invalid parameters'));
            } ;
            
        });
    } ;

    static async startTransaction(){
        return new Promise(async(resolve, reject) => {
            var pool = await MySQLDBConnector.getPool();
            await pool.execute('START TRANSACTION',(err) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(pool);
                }
            });
        });
    } ;

    static async rollbackTransaction(pool){ 
        const con = pool ;
        return new Promise(async(resolve, reject) => {
            
            await con.execute('ROLLBACK',(err) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    resolve(con);
                }
            });
        });
    }
    
    static async endTransaction(pool){
        const con = pool ;
        return new Promise(async(resolve, reject) => {
            
            await con.execute('COMMIT',(err) => {
                if (err) {
                    throw new Error(err);
                } else {
                    resolve(con);
                }
            });
        });
    }

} ;

exports.MySQLDBConnector = MySQLDBConnector;