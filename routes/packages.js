
const databaseAccessor = require('../database/controllers/database');

const express = require('express');
const router = express.Router();

var packagesid = ['d09745340cebd03c6e0a','ab7adb97a1f89a92527a','bfcd68043040f450b8e7'];

try {
   
    module.exports = () => {
        
        router.get('/', async (request, response) => { 
            const package_and_items_3000 = await databaseAccessor.getPackageItems(packageid = 'd09745340cebd03c6e0a');
            const package_and_items_3800 = await databaseAccessor.getPackageItems(packageid = 'ab7adb97a1f89a92527a');
            const package_and_items_4900 = await databaseAccessor.getPackageItems(packageid = 'bfcd68043040f450b8e7');
            
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
} catch(err) {
    console.log(err);
}
