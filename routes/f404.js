const express = require('express');
const router = express.Router();

const {decode} = require('html-entities');

module.exports = () => { 
    
    router.get('/*', (request, response) => { 
        var categories = request.locals.categories;
        response.render('layout', { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For',
             template: 'f404',
            csrfToken: request.csrfToken(),
            categories: categories,
            decode: decode,
            });
    });
     


    return router;
};

