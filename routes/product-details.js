const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });
const {MySQLDBConnector} = require('../database/models/MySQLDBConnector');
const {decode, encode} = require('html-entities');
module.exports = () => { 
    
    /*
    router.get('/',  csrfProtection, async(request, response) => { 
        
        var categories = request.session.categories;
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        console.log(`User cart : ${JSON.stringify(userCart)}`);
        response.render('layout', { 
            pageTitle: 'Details of Product with title BlaBlaBla', 
            template: 'product-details',
            csrfToken: request.csrfToken(),
            userCart:userCart,
            decode: decode,
            encode: encode,
            categories: categories,
        });
    });
    */
    

    router.get('/:category_webid',  csrfProtection, async(request, response) => { 

        //Send to product-details page the item and all items in the same category
        var category_webid = new String(request.params.category_webid);
        var itemsByCategoryWebID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryWebID)) ;
        var itemsByCategoryID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryID)) ;
        //console.log(`itemsByCategoryWebID : ${JSON.stringify(itemsByCategoryWebID)}`);
        var  item = null ;
        
        if (!(category_webid in itemsByCategoryWebID) ) {
            response.redirect('/f404');
            return router;
        }
        item = await JSON.parse(JSON.stringify(itemsByCategoryWebID[category_webid])) ;
        
        var categories =  await JSON.parse(JSON.stringify(request.session.categories));
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        //console.log(`User cart : ${JSON.stringify(userCart)}`);
        const itemTitle = item.item_name ;
        const item_category_id = item.category_id ;
        const itemsWithSimilarCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID[item_category_id]));

        //find the category name of the category to which this item belongs to.
        var category = categories.find(category => category.category_id === item_category_id) ;
        
        var category_name = decode(category.category_name) ;
        response.render('layout', { 
            pageTitle: itemTitle, 
            template: 'product-details',
            csrfToken: request.csrfToken(),
            userCart:userCart,
            item:item,
            IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
            decode: decode,
            encode: encode,
            categories: categories,
            itemsWithSimilarCategoryID:itemsWithSimilarCategoryID,
            item_category_name: category_name,
        });
    });



    return router;
};
