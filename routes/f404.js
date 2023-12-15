const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/*', (request, response) => { 
        response.render('layout', { pageTitle: 'Sorry We Could Not Find What You Are Looking For', template: 'f404'});
    });
     


    return router;
};

