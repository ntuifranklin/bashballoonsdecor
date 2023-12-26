

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

}

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
Takes an already made mysql connection table, and the field of the primary key of the table. 
Generates a unique ID for that field in a transaction and returns the Id generated.
The step is to generate one, then check if it exists in the table.
If it does not, generate another one.
*/
async function generateUniqueID(con=null, tableName='IndividualItems', keyFieldName='individItemID') {

  if (con === null) 
    return await new Promise(async function(resolve,reject) {

        reject(new Error().message = "Connection object is null");
    });

  return await new Promise(async function(resolve,reject){
      

    con.connect(function(err) {
      if (err) reject(err);
      let new_uuid;
      new_uuid = uuidv4();
      selectsql = `
                    SELECT count(*) as IDCOUNT
                    FROM ${tableName}
                    WHERE ${keyFieldName} = '${new_uuid}'
                  `;
      con.query(selectsql, function (err, result, fields) {
        if (err) reject(err);
        resolve(result) ;
      });
      
    });
  });
  
} ;

exports.generateUniqueID = generateUniqueID ;


async function insertMultipleRowsIntoTable(con=null, tableName='', data=[]) {

  return new Promise(async function(resolve,reject){
    try {

      // Start Transaction
      try {
         // Add Data in a batch
         await con.batch(
            `INSERT INTO ${tableName} VALUES(?)`,
            data
         );
         
      } catch(err){
         reject(err);
      }
  
   } catch(err){
      reject(err);
     
   }
  
   resolve(1);

  });
  
}

