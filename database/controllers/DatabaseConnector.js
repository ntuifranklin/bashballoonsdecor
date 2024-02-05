var mysql = require('mysql');
require('dotenv').config();
const mysql_promise = require('mysql2/promise');

class DatabaseConnector {
    constructor() {
      if (!DatabaseConnector.instance) {
        // Create the singleton instance
        DatabaseConnector.instance = this;
  
        // Database connection pool with a maximum of 10 connections
        this.pool = mysql_promise.createPool({
          host: process.env.DATABASE_HOST,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          connectionLimit: 10
        });
      }
  
      return DatabaseConnector.instance;
    }
  
    async query(sql, params) {
      let connection;
  
      try {
        // Get a connection from the pool
        connection = await this.pool.getConnection();
  
        // Run the query
        const [results] = await connection.execute(sql, params);
  
        return results;
      } catch (error) {
        console.error('Database query error:', error);
        throw error; // Rethrow the error to be caught by the caller
      } finally {
        if (connection) {
          // Release the connection back to the pool
          connection.release();
        }
      }
    }
  
    async connect() {
      try {
        // This method is optional in a connection pool setup,
        // as connections are managed by the pool automatically.
        // It's included here for completeness.
        this.pool.getConnection();
        console.log('Connected to the database.');
      } catch (error) {
        console.error('Database connection error:', error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }
  
    async disconnect() {
      try {
        // Close all connections in the pool
        await this.pool.end();
        console.log('Disconnected from the database.');
      } catch (error) {
        console.error('Database disconnection error:', error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }
  } ;
  exports.DatabaseConnector = DatabaseConnector;
  