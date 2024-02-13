const express = require('express');
const router = express.Router();


module.exports = () => { 
    
    router.get('/',  (request, response) => { 
        var categories = request.locals.categories;
        response.render('layout', { 
            pageTitle: 'Contact Us', 
            template: 'contact',
            csrfToken: request.csrfToken(),
            categories: categories,
        });
    });
     


    return router;
};

