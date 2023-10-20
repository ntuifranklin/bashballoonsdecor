
const sqlite3 = require('sqlite3').verbose();

// open the database
function getPackageItems (packageid = '') {
    let db = new sqlite3.Database('./database/sqlitefile/mvp_database.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          throw(err.message);
        } else {
          console.log('Connected to the mvp database.');
          db.serialize(() => {
              selectsql = `SELECT *
              FROM package_contains_items pci
              JOIN package p ON p.packageid = pci.packageid
              JOIN packageitems pi on pci.packageitemid = pi.packageitemid
              WHERE pci.packageid = '${packageid}'
              ORDER BY packageid, packageitemid
              `;
              //console.log(selectsql)
              db.all(selectsql, (err, rows) => {
                if (err) {
                  reject(err.message);
                } else {
                    //console.log(`rows: `, rows);
                    return rows;
                }
              });
          });
          db.close((err) => {
              if (err) {
                console.error(err.message);
              }
              console.log('Close the database connection.');
          });
        }
      });
}

exports.getPackageItems = getPackageItems