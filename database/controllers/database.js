

var mysql = require('mysql');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

const {MySQLDBConnector} = require('../models/MySQLDBConnector');


/* 
Takes an already made mysql connection table, and the field of the table, and 
a value. It counts the rows whose value matches the one given
*/
async function countMatchingField(con=null, tableName='IndividualItems', keyFieldName='individItemID', value='') {

  if (con === null) 
    return await new Promise(async function(resolve,reject) {

        reject(new Error().message = "Connection object is null in function countMatchingField");
    });

  return await new Promise(async function(resolve,reject){
    countsql = `
    SELECT count(*) as ROWCOUNT
    FROM ${tableName}
    WHERE ${keyFieldName} = '${value}'
    `;
    con.query(countsql, async function (err, result, fields) {
    if (err) reject(err);
    resolve(result[0].ROWCOUNT) ;
    });  
  });
  
} ;

exports.countMatchingField = countMatchingField ;

async function generateUniqueID(con=null, tableName='IndividualItems', keyFieldName='individItemID', size=16) { 
  
  if (con === null) 
    return await new Promise(async function(resolve,reject) {

        reject(new Error().message = "Connection object is null in function generateUniqueID");
    });
  
  return await new Promise(async function(resolve,reject) {

    var id = uuidv4().split('-').join('') ;
    id = id.substring(0, size);
    var count = await countMatchingField(con, tableName, keyFieldName, id) ;
    while (count > 0) {
      id = uuidv4().split('-').join('') ;
      count = await countMatchingField(con, tableName, keyFieldName, id) ;
    }
    resolve(id) ;

  });

}

exports.generateUniqueID = generateUniqueID ;



async function getCategories (con=null,tableName='categories') {
    var tableName = tableName;
    return await new Promise(async(resolve, reject) => {
      
        try {            
            selectsql = `
            SELECT * 
            FROM categories
          `;
          var result = await MySQLDBConnector.execute(selectsql, []) 
            
          resolve(result) ;
        } catch( err ){
          reject(err);
        } ;
    });
  
  }
  
  exports.getCategories = getCategories ;

  
async function getCategoriesItems (tableName='category_items', category_id='') {
  
    var tableName = new String(tableName);
    var category_id = new String(category_id);

    return await new Promise(async(resolve, reject) => {
      try {            
        selectsql = `
                      SELECT * 
                      FROM category_items
                    `;
        var params = [] ;
        if (category_id != '') {
          params[0] = category_id ;
          selectsql += ` WHERE category_id = ? `;
        } ;
        var result = await MySQLDBConnector.execute(selectsql, params)  ;
        resolve(result) ;
    } catch( err ){
      console.log(`Error in getCategoriesItems: ${err}`);
      reject(err);
    } ;
    }) ;
  

}

exports.getCategoriesItems = getCategoriesItems ;


/* This function below takes a text and generates the mysql password for it */

async function mysqlpassword(con=null, text='anything') {
  return await new Promise(async(resolve, reject) => {
    selectsql = `SELECT PASSWORD(?) as password_hash`;
    await con.execute(selectsql, [text], async function (err, result) {
      if (err) reject(err);
      else
        resolve(result[0].password_hash) ;
    });
  });
} ;

exports.mysqlpassword = mysqlpassword ;