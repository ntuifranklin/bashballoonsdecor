const express = require('express');
const router = express.Router();

const createError = require('http-errors');
const bodyParser = require('body-parser');


module.exports = () => { 
    
    router.get('/', (request, response) => { 
        
        var userCart ;
        if (!request.session.userCart) {
            request.session.userCart = {} ;
        };
        userCart = request.session.userCart ;
        response.render('layout', { pageTitle: 'Your Cart Items', template: 'cart', userCart: userCart});
    });

    router.post('/', (request, response) => {
         
        if (!request.session.userCart) {
            request.session.userCart = {} ;
        };
        
        var itemUpdateID = request.body.itemUpdateID;
        var productOrPackage = request.body.updateType ;
        var keyToUpdate = "";
        if (productOrPackage == "product")
            keyToUpdate = "product" ;
        else 
            keyToUpdate = "package";
        console.log(`${itemUpdateID}`);
        if (!request.session.userCart[keyToUpdate]) {
            request.session.userCart[keyToUpdate] = {
                
            }
        }
        if (!request.session.userCart[keyToUpdate][itemUpdateID]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
            }
        }
        
        if (request.session.userCart[keyToUpdate][itemUpdateID]) {
            request.session.userCart[keyToUpdate][itemUpdateID] = {
                "quantity" : 0
            }
        }
        request.session.userCart[keyToUpdate][itemUpdateID]["quantity"] += 1;
        request.session.save();
        response.end();
        //response.redirect(200, '/product-list');
    });
     


    return router;
};

