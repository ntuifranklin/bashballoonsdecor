
const databaseAccessor = require('../database/controllers/database');
const express = require('express');
const router = express.Router();
require('dotenv').config();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });
try {
   
    module.exports = () => {
        /*
         * Get the packages from the request.locals.packagesAndItems object
         */
        
        router.get('/', csrfProtection, async (request, response) => {

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
                csrfToken: request.csrfToken()
            });
            
        });

        return router;
    };
} catch(err) {
    console.log(err);
}
