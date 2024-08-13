

const {decode, encode} = require('html-entities');

const {
    ITEMS_BY_CATEGORY_ID,
    ITEMS_BY_CATEGORY_WEB_ID,
    CATEGORIES_TABLE,
    USER_CART,
    USER,
    IMG_DIR_FOR_WEB
} = require('../utilities/web_page_variables');

const {
    F404_ROUTE
} = require('../utilities/routes_constant_names');

const viewProductDetailsPage = async(request, response) => { 
   
    //Send to product-details page the item and all items in the same category
    var category_webid = new String(request.params.category_webid);
    
    //console.log(`Category Name Encoded : ${category_name}`);
    var userCart = {} ;
    var user = {} ;
    var app_cache = request.locals.app_cache ;   
    //console.log(`app_cache["${CATEGORIES_TABLE}"]: ${JSON.stringify(app_cache.get(CATEGORIES_TABLE))}`); 
    let categories = await app_cache.get(CATEGORIES_TABLE);
    let itemsByCategoryID = await app_cache.get(ITEMS_BY_CATEGORY_ID)
    categories = JSON.parse(JSON.stringify(categories));
    itemsByCategoryID = JSON.parse(JSON.stringify(itemsByCategoryID));

    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;
    user = await JSON.parse(JSON.stringify(user)) ;

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    
    userCart = await JSON.parse(JSON.stringify(userCart)) ;
    itemsByCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID)) ;
    let itemsByCategoryWebID = {};
    itemsByCategoryWebID = await app_cache.get(ITEMS_BY_CATEGORY_WEB_ID);
    itemsByCategoryWebID = await JSON.parse(JSON.stringify(itemsByCategoryWebID)) ;
    
    let  item = null ;

    if (!(category_webid in itemsByCategoryWebID) ) {
        response.redirect(`/${F404_ROUTE}`);
        return ;
    };
    item = await JSON.parse(JSON.stringify(itemsByCategoryWebID[category_webid])) ;

    const itemTitle = decode(item.item_name) ;
    const item_category_id = item.category_id ;
    const itemsWithSimilarCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID[item_category_id]));

    //find the category name of the category to which this item belongs to.
    var category = categories.find(category => category.category_id === item_category_id) ;
    const seoSiteLink = request.locals.seoSiteLink ;

    var seoObject = {
        title: `Elegant Event Rentals - ${itemTitle} at ${seoSiteLink}`,
        description: `Make your event memorable with our Elegant ${itemTitle}, Elevate your event with ${seoSiteLink}`,
        type:'product',
    } ;

    const itemImageUrl = item.imageurl;
    if (itemImageUrl != "" ) {
        seoObject["itemImageUrl"] = itemImageUrl ;
    }
    var category_name = decode(category.category_name) ;
            
    response.render('layout', { 
        pageTitle: itemTitle, 
        template: 'product-details',
        csrfToken: request.csrfToken(),
        userCart:userCart,
        user:user,
        item:item,
        IMG_DIR_FOR_WEB:IMG_DIR_FOR_WEB,
        decode: decode,
        encode: encode,
        categories: categories,
        itemsWithSimilarCategoryID: itemsWithSimilarCategoryID,
        item_category_name: category_name,
        seoObject:seoObject
    });
} ;

exports.viewProductDetailsPage = viewProductDetailsPage;