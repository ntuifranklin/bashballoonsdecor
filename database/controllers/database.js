

var mysql = require('mysql');


require('dotenv').config();


// open the database
async function getPackageItems (packageid= '') {

    return new Promise((resolve, reject) => {
                
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
          
          resolve(result) ;
        });
      });
      
   
    });

}

exports.getPackageItems = getPackageItems ;


async function getIndividualItems () {

  return await new Promise((resolve, reject) => {
              
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
        
        resolve(result) ;
      });
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
  return await new Promise((resolve, reject) => {
              
    var con = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    });

     con.connect(function(err) {
      if (err) reject(err);
      selectsql = `SELECT *
                    FROM ${tableName}
                    WHERE ${keyFieldName} = '${keyFieldValue}'
                  `;
      con.query(selectsql, function (err, result, fields) {
        if (err) reject(err);
        
        resolve(result) ;
      });
    });
    
  });

}

exports.getDatabaseObject = getDatabaseObject ;


