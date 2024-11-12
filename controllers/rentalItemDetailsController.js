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

const {MySQLDBConnector} = require('../database/models/MySQLDBConnector');

const {readDataFromRedisCache} = require("../middleware/redis");
const viewRentalItemDetailsPage = async(request, response) => { 
   
    //Send to product-details page the item and all items in the same category
    var item_category_webid = new String(request.params.item_category_webid);
                
    const selectsql = `
    SELECT * 
    FROM category_items WHERE category_webid = ?
    `;
    const params = [item_category_webid] ;
    //console.log(`category_webid: ${item_category_webid}`);

    //console.log(`Running sql ${selectsql}`);
    var category_item = await MySQLDBConnector.execute(selectsql, params)  ;
    //console.log(`${JSON.stringify(uniqueCategoryItem)}`);
    //console.log(`Category Name Encoded : ${category_name}`);
   
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
    
    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
    
    let  item = null ;
    var categorywebIDFound = false ;
    var one_category_item = null ;
    var index = -1;
    var catwebid = null ;
    var catid = null ;
    
    if (category_item.length == 0) {
        response.redirect(`/${F404_ROUTE}`);
        //console.log(`Item not found`);
        return;
    }else {
        categorywebIDFound = true;
        item = JSON.parse(JSON.stringify(category_item[0]));
        //console.log(`${JSON.parse(JSON.stringify(item))}`);
        const categoryID = item.category_id;
        const selectsql = `
            SELECT * 
            FROM category_items WHERE category_id = ?
            `;
        const params = [categoryID] ;
        //console.log(`category_id: ${categoryID}, category_weburl: ${category_weburl}`);
        
        //console.log(`Running sql ${selectsql}`);
        var similar_category_items = await MySQLDBConnector.execute(selectsql, params)  ;
        
        
        //console.log(`similar_category_items: ${similar_category_items}`);

        const itemTitle = decode(item.item_name) ;
        
        //const itemsWithSimilarCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID));

        //find the category name of the category to which this item belongs to.
        var category = null;
        const seoSiteLink = request.locals.fullUrl ;

        var seoObject = {
            title: `Elegant Event Rentals - ${itemTitle} at ${seoSiteLink}`,
            description: `Make your event memorable with our Elegant ${itemTitle}, Elevate your event with ${seoSiteLink}`,
            type:'product',
            baseServerUrl: seoSiteLink,
        } ;

        const itemImageUrl = item.imageurl;
        if (itemImageUrl != "" ) {
            seoObject["itemImageUrl"] = itemImageUrl ;
        }
    
                
        response.render('layout', { 
            pageTitle: itemTitle, 
            template: 'rental-item-details',
            csrfToken: request.csrfToken(),
            userCart:userCart,
            user:user,
            item:item,
            IMG_DIR_FOR_WEB:IMG_DIR_FOR_WEB,
            decode: decode,
            encode: encode,
            categories: categories,
            itemsWithSimilarCategoryID: similar_category_items,
            item_category_name: itemTitle,
            seoObject:seoObject
        });
    }
    
} ;

exports.viewRentalItemDetailsPage = viewRentalItemDetailsPage;