const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/', (request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { pageTitle: 'Checkout', template: 'checkout', userCart: userCart});
    });
     


    return router;
};

