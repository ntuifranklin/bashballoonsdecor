const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });

module.exports = () => { 
    router.get('/',  csrfProtection, (request, response, next) => { 
        response.redirect('/product-list');
    });
    
    
    router.get('/:individualItemID',csrfProtection, async (request, response) => { 
        console.log(`request.params.individualItemID : ${request.params.individualItemID}`);
        /*
        const individItemID = request.params.individualItemID;
        //console.log(`individItemID given : ${individItemID}`);
        var foundItem = {} ;
        var pageTitle = "Unknown Page";
        const allItemsAsDict = request.locals.individualItems;
        //console.log(`allItemsAsDict : ${JSON.stringify(allItemsAsDict,null, 4)}`);
        //var allkeys = new String(Object.keys(allItemsAsDict));
        //const arraykeys = allkeys.split(',');
        //console.log(`keys of object :  ${JSON.stringify(arraykeys,null, 4)}`);
        if (individItemID in allItemsAsDict) {

            foundItem = allItemsAsDict[individItemID] ;
            //console.log(`foundItem : ${JSON.stringify(foundItem,null, 4)}`);
            pageTitle = `Page details for ${foundItem.individualItemDetails.individItemTitle}`;
            //response.setHeader("Content-type", "text/html") ;
            
            response.setHeader("Access-Control-Allow-Origin", "*");
            //response.statusCode = 200;
            response.render('layout', { 
                pageTitle: `${pageTitle}`, 
                template: 'product-details',
                csrfToken: request.csrfToken(),
                individualItem: foundItem
            });
        } else {
            response.redirect('/f404');
        }
        */
      
        
    });
    
    
    return router;
};
