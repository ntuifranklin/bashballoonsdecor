const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });

module.exports = () => { 
    
    router.get('/:individualItemID',csrfProtection, (request, response) => { 
        const individItemID = new String(request.params.individualItemID);
        console.log(`individItemID given : ${individItemID}`);
        var foundItem = {} ;
        var pageTitle = "Unkonwn Page Title";
        const allItemsAsDict = JSON.parse(JSON.stringify(request.locals.individualItems));
        //console.log(`allItemsAsDict : ${JSON.stringify(allItemsAsDict,null, 4)}`);
        var allkeys = new String(Object.keys(allItemsAsDict));
        const arraykeys = allkeys.split(',');
        //console.log(`keys of object :  ${JSON.stringify(arraykeys,null, 4)}`);
        foundItem = arraykeys.find((item) => {
            //console.log(`item : ${item}`);
            if (item === individItemID) {
                return allItemsAsDict[individItemID] ;
            } ;
            
        }); 
      
        if (foundItem === undefined || foundItem == {}) {
            return response.status(404).render('layout', { 
                pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
                template: 'f404',
                csrfToken: request.csrfToken(),
            });
        };
        console.log(`foundItem : ${JSON.stringify(foundItem,null, 4)}`);
        pageTitle = foundItem.individualItemDetails.individItemTitle;
        return response.status(200).render('layout', { 
            pageTitle: `${pageTitle}`, 
            template: 'product-details',
            csrfToken: request.csrfToken(),
            individualItem: foundItem
        });
    });

    /*
    //No default route for this page
    router.get('/',  csrfProtection, (request, response, next) => { 
        
        response.redirect('/product-list');
        //next();
        
    });
    */


    return router;
};
