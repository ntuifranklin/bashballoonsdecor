

var mysql = require('mysql');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// open the database
async function getPackageItems (packageid= '') {

    return await new Promise(async(resolve, reject) => {
                
      var con = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      });

       con.connect( function(err) {
        if (err) reject(err);
        
        selectsql = `SELECT *
                FROM package_contains_items pci
                JOIN package p ON p.packageid = pci.packageid
                JOIN packageitems pi on pci.packageitemid = pi.packageitemid
                WHERE pci.packageid = '${packageid}'
                ORDER BY pci.packageid, pci.packageitemid
                `;
        con.query(selectsql, function (err, result, fields) {
          if (err) reject(err);
          con.end();
          resolve(result) ;
          
        });
        //con.end();
      });
    });
} ;

exports.getPackageItems = getPackageItems ;

async function getIndividualItems () {

  return await new Promise(async(resolve, reject) => {
              
    var con = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    });

     con.connect(function(err) {
      if (err) reject(err);
      selectsql = `SELECT *
                    FROM IndividualItems
                  `;
      con.query(selectsql, function (err, result, fields) {
        if (err) reject(err);
        con.end();
        resolve(result) ;
        
      });
      //con.end();
    });

    
  });

}

exports.getIndividualItems = getIndividualItems


async function getDatabaseObject (tableName='IndividualItems', keyFieldName='individItemID', keyFieldValue='') {
/*
MariaDB [bashballoonsdecor]> describe IndividualItems ;
+-------------------------+-----------+------+-----+---------+-------+
| Field                   | Type      | Null | Key | Default | Extra |
+-------------------------+-----------+------+-----+---------+-------+
| individItemID           | char(10)  | NO   | PRI | NULL    |       |
| individItemTitle        | char(100) | NO   |     | NULL    |       |
| individItemDescription  | char(100) | NO   |     | NULL    |       |
| individItemUnitCost     | float     | NO   |     | NULL    |       |
| individItemQtyAvailable | int(11)   | NO   |     | NULL    |       |
+-------------------------+-----------+------+-----+---------+-------+
5 rows in set (0.004 sec)

MariaDB [bashballoonsdecor]> describe package
    -> ;
+-------------+-------------+------+-----+---------+-------+
| Field       | Type        | Null | Key | Default | Extra |
+-------------+-------------+------+-----+---------+-------+
| packageid   | varchar(20) | NO   | PRI | NULL    |       |
| packagedesc | varchar(22) | YES  |     | NULL    |       |
| packagecost | smallint(6) | YES  |     | NULL    |       |
+-------------+-------------+------+-----+---------+-------+
3 rows in set (0.071 sec)

*/
  return await new Promise(async(resolve, reject) => {
              
    var con = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    });

     con.connect(function(err) {
      if (err) reject(err);
      selectsql = `
                    SELECT *
                    FROM ${tableName}
                    WHERE ${keyFieldName} = '${keyFieldValue}'
                  `;
      //console.log(`Running sql in getDatabaseObject : ${selectsql}`);
      con.query(selectsql, function (err, result, fields) {
        if (err) reject(err);
        con.end();
        resolve(result) ;
       
      });
      //con.end();
    });
    
  });

}

exports.getDatabaseObject = getDatabaseObject ;

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

async function generateUniqueID(con=null, tableName='IndividualItems', keyFieldName='individItemID') { 
  
  if (con === null) 
    return await new Promise(async function(resolve,reject) {

        reject(new Error().message = "Connection object is null in function generateUniqueID");
    });
  
  return await new Promise(async function(resolve,reject) {

    var id = uuidv4().split('-').join('') ;;
    var count = await countMatchingField(con, tableName, keyFieldName, id) ;
    while (count > 0) {
      id = uuidv4().split('-').join('') ;
      count = await countMatchingField(con, tableName, keyFieldName, id) ;
    }
    resolve(id) ;

  });

}

exports.generateUniqueID = generateUniqueID ;



async function getCategories (tableName='categories') {
 
    return await new Promise(async(resolve, reject) => {
                
      var con = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_UPGRADED_NAME
      });
  
       con.connect(function(err) {
        if (err) reject(err);
        selectsql = `
                      SELECT *
                      FROM ${tableName}
                    `;
        //console.log(`Running sql in getDatabaseObject : ${selectsql}`);
        con.query(selectsql, function (err, result, fields) {
          if (err) reject(err);
          con.end();
          resolve(result) ;
         
        });
        //con.end();
      });
      
    });
  
  }
  
  exports.getCategories = getCategories ;

  
async function getCategoriesItems (con=null,tableName='category_items', category_id='') {
  if ( con !== null )
  return await new Promise(async(resolve, reject) => {
    
    selectsql = `
                    SELECT *
                    FROM ${tableName}
                  `;
    if (category_id !== '') {
        selectsql += ` WHERE category_id = ? `;
        await con.execute(selectsql, [category_id], async function (err, result, fields) {
          if (err) reject(err);
          else
          resolve(result) ;
         
        });
    } else {
      await con.execute(selectsql,  async function (err, result, fields) {
        if (err) reject(err);
        else
        resolve(result) ;
       
      });
    }
      //console.log(`Running sql in getDatabaseObject : ${selectsql}`);
      
    
  })
  else 
    return new Error("Connection object is null in function getCategoriesItems");

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