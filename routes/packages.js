
const databaseAccessor = require('../database/controllers/database');
const express = require('express');
const router = express.Router();

try {
   
    module.exports = () => {
        /*
         * Get the packages from the request.locals.packagesAndItems object
         */
        
        router.get('/', async (request, response) => {

            /* must have been loaded in server.js file  */   
            var package3000ID = 'd09745340cebd03c6e0a';
            var package3800ID = 'ab7adb97a1f89a92527a';
            var package4900ID = 'bfcd68043040f450b8e7';
            console.log(`Packages And Items in packages.js: ${JSON.stringify(request.locals.packagesAndItems,null, 4)}`); 
            
            var package3000 = request.locals.packagesAndItems[package3000ID];
            var package3800 =  request.locals.packagesAndItems[package3800ID] ;
            var package4900 = request.locals.packagesAndItems[package4900ID] ;
            
            response.render('layout', {
                pageTitle: 'Packages and Bundles', 
                template: 'packages',
                package3000: request.locals.packagesAndItems[package3000ID],
                package3800: request.locals.packagesAndItems[package3800ID],
                package4900: request.locals.packagesAndItems[package4900ID],
            });
            
        });

        return router;
    };
} catch(err) {
    console.log(err);
}
