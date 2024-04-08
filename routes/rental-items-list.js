const express = require('express');
const router = express.Router();
const {decode,encode} = require('html-entities');


/* For caching data to increase speed */
const NodeCache = require( "node-cache" );
const cache = new NodeCache();

module.exports = () => {
        
    router.get('/', async(request, response) => { 
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        
        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
        };
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'rental-items-list',
            IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
            category: 'Individual Party Rental Items',
            csrfToken: request.csrfToken(),
            categories: categories,
            userCart: userCart,
            decode: decode,
            encode: encode,
        }); 
    });
    return router;
};



