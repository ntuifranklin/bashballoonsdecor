const { DatabaseConnector } = require('./DatabaseConnector');
const { v4: uuidv4 } = require('uuid');

async function getPackageItems (packageid= '') {
  const db = new DatabaseConnector();

  try {
    await db.connect();
    selectsql = `SELECT *
    FROM package_contains_items pci
    JOIN package p ON p.packageid = pci.packageid
    JOIN packageitems pi on pci.packageitemid = pi.packageitemid
    WHERE pci.packageid = '${packageid}'
    ORDER BY pci.packageid, pci.packageitemid
    `;
    const results = await db.query(selectsql);
    console.log(`\nRan query ${selectsql} and got \n ${JSON.stringify(results)}`);
    return results ;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.disconnect();
  };
}

exports.getPackageItems = getPackageItems ;

async function getIndividualItems () {
  const db = new DatabaseConnector();

  try {
    await db.connect();
    selectsql = `SELECT *
    FROM IndividualItems
    `;
    const results = await db.query(selectsql);
    console.log(`\nRan query ${selectsql} and got \n ${JSON.stringify(results)}`);
    return results ;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.disconnect();
  }
}

exports.getIndividualItems = getIndividualItems ;

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

  const db = new DatabaseConnector();
  try{
    await db.connect();

    selectsql = `SELECT *
    FROM ${tableName}
    WHERE ${keyFieldName} = '${keyFieldValue}'
    `;
    const results = await db.query(selectsql);
    console.log(`\nRan query ${selectsql} and got \n ${JSON.stringify(results)}`);
    return results ;
  } catch (error) {
    console.error('Error:', error);

  } finally {
    await db.disconnect();

  } ;
}

exports.getDatabaseObject = getDatabaseObject ;
/* 
Takes an already made mysql connection table, and the field of the table, and 
a value. It counts the rows whose value matches the one given
*/
async function countMatchingField( tableName='IndividualItems', keyFieldName='individItemID', value='') {
  const db = new DatabaseConnector();
  try{
    await db.connect();
    countsql = `
    SELECT count(*) as ROWCOUNT
    FROM ${tableName}
    WHERE ${keyFieldName} = '${value}'
    `;
    const results = await db.query(countsql);
    console.log(`\nRan query ${countsql} and got \n ${JSON.stringify(results)}`);
    return results ;
  } catch (error) {
    console.error('Error:', error);

  } finally {
    await db.disconnect();

  } ;

} ;

exports.countMatchingField = countMatchingField ;

async function generateUniqueID(tableName='IndividualItems', keyFieldName='individItemID') { 

  
  return await new Promise(async function(resolve,reject) {

    var id = uuidv4().split('-').join('') ;
    var count = await countMatchingField(tableName, keyFieldName, id) ;
    while (count > 0) {
      id = uuidv4().split('-').join('') ;
      count = await countMatchingField(tableName, keyFieldName, id) ;
    }
    resolve(id) ;
  });
} ;

exports.generateUniqueID = generateUniqueID ;


