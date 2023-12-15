
const databaseAccessor = require('../database/controllers/database');
const express = require('express');
const router = express.Router();
require('dotenv').config();

try {
   
    module.exports = () => {
        /*
         * Get the packages from the request.locals.packagesAndItems object
         */
        
        router.get('/', async (request, response) => {

            /* must have been loaded in server.js file  */  
            var package3000ID = process.env.PACKAGE3000ID;
            var package3800ID = process.env.PACKAGE3800ID;
            var package4900ID = process.env.PACKAGE4900ID;
            //console.log(`Packages And Items in packages.js: ${JSON.stringify(request.locals.packagesAndItems,null, 4)}`); 
            
            var package3000 = request.locals.packagesAndItems[package3000ID];
            var package3800 =  request.locals.packagesAndItems[package3800ID] ;
            var package4900 = request.locals.packagesAndItems[package4900ID] ;
            
            response.render('layout', {
                pageTitle: 'Packages and Bundles', 
                template: 'packages',
                package3000: package3000,
                package3800: package3800,
                package4900: package4900,
            });
            
        });

        return router;
    };
} catch(err) {
    console.log(err);
}
