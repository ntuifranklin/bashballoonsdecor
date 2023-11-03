

var mysql = require('mysql');


require('dotenv').config();
/*

export DATABASE_NAME='bashballoonsdecor'
export DATABASE_HOST='localhost'
export DATABASE_USER='spacehawk'
export DATABASE_PASSWORD='jQTH3jhzeaweS65dDedfCASlsvg='
*/


// open the database
async function getPackageItems (packageid = '') {

    return new Promise((resolve, reject) => {
                
      var con = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
      });

       con.connect(function(err) {
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

exports.getPackageItems = getPackageItems
