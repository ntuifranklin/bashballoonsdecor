

var mysql = require('mysql');


// open the database
async function getPackageItems (packageid = '') {

    return new Promise((resolve, reject) => {
                
      var con = mysql.createConnection({
        host: "localhost",
        user: "spacehawk",
        password: "jQTH3jhzeaweS65dDedfCASlsvg=",
        database: "bashballoonsdecor"
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
