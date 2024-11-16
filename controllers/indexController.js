
const {decode, encode} = require('html-entities');

const {IMG_DIR_FOR_WEB} = require('../utilities/fileupload');

const { readDataFromRedisCache, writeDataToRedisCache } = require("../middleware/redis");
// for server ip :
const {
    ITEMS_ARRAY,
    ITEMS_BY_CATEGORY_ID,
    CATEGORIES_TABLE,
    USER_CART,
    USER
} = require('../utilities/web_page_variables');

const {
    RENTAL_DETAILS_ROUTE
} = require('../utilities/routes_constant_names');


const {MySQLDBConnector} = require('../database/models/MySQLDBConnector');
const homePage =  async (request, response) => { 
    /* must have been loaded in server.js file  */  
    
    
    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
    var userCart = await readDataFromRedisCache(USER_CART);
    var user = await readDataFromRedisCache(USER);
    if (!userCart)
        userCart = {} ;
    if (!user)
        user = {} ;
    userCart = await JSON.parse(userCart);
    user = await JSON.parse(user);

    
    const seoSiteLink = request.locals.seoSiteLink ;
    var seoObject = {
        title: request.locals.siteName,
        description: `Transform your event into an unforgettable celebration with our premier party rental service.\n
        with ${seoSiteLink}
        `,
    };

    //console.log(`User cart : ${JSON.stringify(userCart)}`);
    response.render('layout', 
    { 
        pageTitle: request.locals.siteName, 
        template: 'index_lightweight', 
        userCart : userCart,
        user:user,
        categories: categories,
        IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
        csrfToken: request.csrfToken(),
        customers_feedback: request.locals.customers_feedback,
        decode: decode,
        encode: encode,
        seoObject : seoObject
    });
    
} ;

const rentalItemsPerCategoryPage = async(request, response) => { 
        
    var category_weburl = new String(request.params.category_weburl);
    //console.log(`Category web url : ${category_weburl}`);

    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
    var userCart = await readDataFromRedisCache(USER_CART);
    var user = await readDataFromRedisCache(USER);
    
    if (!userCart)
        userCart = {} ;
    if (!user)
        user = {} ;
    userCart = await JSON.parse(userCart);
    user = await JSON.parse(user);

    //const items_array = await app_cache.get(ITEMS_ARRAY);
    
    
    var category = {} ;
    var index = -1;
    var categoryID = "";
    
    for (var i = 0; i < categories.length; i++) {
        var one_category = await JSON.parse(JSON.stringify(categories[i]));
        var thiscatwweburl = one_category.category_weburl;
        thiscatwweburl = await JSON.parse(JSON.stringify(thiscatwweburl));
        //console.log(`Category Name : ${one_category.category_name}`);
        //console.log(`Category Web URL : ${one_category.category_weburl} \n\n`);
        if (thiscatwweburl == category_weburl) {
            category = JSON.parse(JSON.stringify(one_category));
            index = i;
            categoryID = new String(JSON.parse(JSON.stringify(one_category.category_id)));
            //console.log(`category id found : ${categoryID}`);
            break;
        }
    }
    
    if (category == {} || index == -1 || categoryID == "") { 
        //console.log(`category id not found`);
        response.status(200).redirect('/'); 
        
        
    } else {
        //Select all items in a category
               
        /* Select categories that match this categoryweburl */
                        
        const selectsql = `
            SELECT * 
            FROM category_items WHERE category_id = ?
            `;
        const params = [categoryID] ;
        //console.log(`category_id: ${categoryID}, category_weburl: ${category_weburl}`);
        
        //console.log(`Running sql ${selectsql}`);
        var category_items = await MySQLDBConnector.execute(selectsql, params)  ;
        //console.log(`${JSON.parse(JSON.stringify(result))}`);
        /* End of Select */
       
        const humanFriendlyCategoryName = decode(category.category_name);
        if (category_items.length > 0) { 
            
            const seoSiteLink = request.locals.seoSiteLink ;
            /* the seo meta tag og:type is set to website by default in headerinclude.ejs. */
            var seoObject = {
                title: `Your ${humanFriendlyCategoryName} for your next party at ${seoSiteLink}`,
                description: `Checkout our list of ${humanFriendlyCategoryName} with ${seoSiteLink} for your event`,
            }
            response.status(200).render('layout',
            {
                pageTitle: decode(category.category_name),
                template: 'rental-items-list',
                categories: categories,
                userCart: userCart,
                RENTAL_DETAILS_ROUTE:RENTAL_DETAILS_ROUTE,
                user:user,
                IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
                category: humanFriendlyCategoryName,
                category_id: categoryID,
                category_items: category_items,
                csrfToken: request.csrfToken(),
                decode: decode,
                encode: encode,
                seoObject:seoObject
            });
        } else {
            response.status(200).render('layout',
            {
                pageTitle: "No Items Found in " + decode(category.category_name) + " Category",
                template: 'noitems',
                categories: categories,
                category_items: category_items,
                userCart: userCart,
                user:user,
                IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
                category: decode(category.category_name),
                csrfToken: request.csrfToken(),
                decode: decode,
                encode: encode,
            });
        } ;
        
    }
    
} ;

const f404Page = async(request, response) => { 
        
      
    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
    var userCart = await readDataFromRedisCache(USER_CART);
    var user = await readDataFromRedisCache(USER);
    
    if (!userCart)
        userCart = {} ;
    if (!user)
        user = {} ;
    userCart = await JSON.parse(userCart);
    user = await JSON.parse(user);

    //const items_array = await app_cache.get(ITEMS_ARRAY);
    
    
    response.status(404).render('layout', 
    { 
        pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
        template: 'f404',
        userCart: userCart, 
        user:user,
        IMG_DIR_FOR_WEB: IMG_DIR_FOR_WEB,
        categories: categories,
        csrfToken: request.csrfToken(),
        decode: decode,
        encode: encode
    });
} ;


module.exports = {
    homePage,
    rentalItemsPerCategoryPage,
    f404Page
};

