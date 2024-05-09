const express = require('express');
const router = express.Router();
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {decode,encode} = require('html-entities');

module.exports = () => { 
    
    /* this route allows someone to search for a list of items based on an item category name */
    router.get('/:category_name',csrfProtection, async(request, response) => { 
        
        var category_name = new String(request.params.category_name);
        //console.log(`Category Name Encoded : ${category_name}`);
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        category_name = category_name.toLocaleLowerCase();
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        var itemsByCategoryID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryID));
        
        var category = {} ;
        var index = -1;
        var categoryID = "";
        category_name = encode(category_name);
        for (var i = 0; i < categories.length; i++) {
            var one_category = await JSON.parse(JSON.stringify(categories[i]));
            
            //console.log(`Category Name Encoded : ${category_name}`);
            if (encode(one_category.category_name.toLocaleLowerCase()) === category_name) {
                category = one_category;
                index = i;
                categoryID = new String(JSON.parse(JSON.stringify(one_category.category_id)));
                break;
            }
        }
        
        if (category == {} || index == -1 || categoryID == "") { 
                        
            response.status(200).redirect('/'); 
            
        } else {
           
            
            var category_items = [] ;
            if (categoryID in itemsByCategoryID) { 
                category_items = itemsByCategoryID[categoryID];
                response.status(200).render('layout',
                {
                    pageTitle: decode(category.category_name),
                    template: 'rental-items-list',
                    categories: categories,
                    items_array: request.session.items_array,
                    userCart: userCart,
                    category: decode(category.category_name),
                    category_id: category.category_id,
                    category_items: category_items,
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                });
            } else {
                response.status(200).render('layout',
                {
                    pageTitle: "No Items Found in " + decode(category.category_name) + " Category",
                    template: 'noitems',
                    categories: categories,
                    category_items: category_items,
                    userCart: userCart,
                    category: decode(category.category_name),
                    csrfToken: request.csrfToken(),
                    decode: decode,
                    encode: encode,
                });
            } ;
            
        }
        
    });

    return router;
};

