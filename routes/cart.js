const express = require('express');
const router = express.Router();

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
        var userCart = request.session.userCart ;
        var productID = request.body.productID;
        if (!userCart["products"]) {
            userCart["products"] = {
                
            }
        }
        if (!userCart["products"][productID]) {
            userCart["products"][productID] = {
                "quantity" : 0
            }
        }
        userCart["products"][productID]["quantity"] += 1;
        request.session.save();
        response.redirect(200, '/product-list');
    });
     


    return router;
};

