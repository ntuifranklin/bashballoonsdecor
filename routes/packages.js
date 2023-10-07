const express = require('express');
const router = express.Router();

const databaseAccessor = require('../database/controllers/database.js');

var databaseAccess = databaseAccessor     
var package_and_items_3000 = 'empty ';
var package_and_items_3800 = 'empty';
var package_and_items_4900 = 'empty';

/*
('d09745340cebd03c6e0a','Package For 150 Guests',3000),
('ab7adb97a1f89a92527a','Package For 250 Guests',3800),
('bfcd68043040f450b8e7','Package For 300 Guests',4900);
*/
var packagesid = ['d09745340cebd03c6e0a','ab7adb97a1f89a92527a','bfcd68043040f450b8e7'];

try {
    package_and_items_3000 = databaseAccess.getPackageItems(packageid='d09745340cebd03c6e0a');
    package_and_items_3800 = databaseAccess.getPackageItems(packageid='ab7adb97a1f89a92527a');
    package_and_items_4900 = databaseAccess.getPackageItems(packageid='bfcd68043040f450b8e7');


} catch(err) {
    console.log(err);

}
console.log('package 3000 : ',package_and_items_3000);
module.exports = () => { 
    
    router.get('/', (request, response) => { 
        //response.locals.dbConn = sqlite3
        response.render('layout', { 
            pageTitle: 'Packages and Bundles', 
            template: 'packages',
            package3000: package_and_items_3000,
            package3800: package_and_items_3800,
            package4900: package_and_items_4900,
        });
        
    });
     


    return router;
};

