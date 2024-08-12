
const {decode, encode} = require('html-entities');

const {IMG_DIR_FOR_WEB} = require('../utilities/fileupload');
const {
    ITEMS_ARRAY,
    ITEMS_BY_CATEGORY_ID,
    CATEGORIES_TABLE,
    USER_CART,
    USER
} = require('../utilities/web_page_variables');

const homePage =  async (request, response) => { 
    /* must have been loaded in server.js file  */  
    
    var app_cache = request.locals.app_cache ;    
    const categories = app_cache.get(CATEGORIES_TABLE);
         
    var userCart = {} ;
    var user = {} ;
    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;
    user = await JSON.parse(JSON.stringify(user));

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    userCart = await JSON.parse(JSON.stringify(userCart));
    const items_array = await app_cache.get(ITEMS_ARRAY);
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
        template: 'index', 
        userCart : userCart,
        user:user,
        categories: categories,
        items_array: items_array,
        IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
        csrfToken: request.csrfToken(),
        customers_feedback: request.locals.customers_feedback,
        decode: decode,
        encode: encode,
        seoObject : seoObject
    });
    
} ;

const rentalItemsPerCategoryPage = async(request, response) => { 
        
    var category_name = new String(request.params.category_name);
    //console.log(`Category Name Encoded : ${category_name}`);
    var userCart = {} ;
    var app_cache = request.locals.app_cache ;   
    //console.log(`app_cache["${CATEGORIES_TABLE}"]: ${JSON.stringify(app_cache.get(CATEGORIES_TABLE))}`); 
    const categories = await app_cache.get(CATEGORIES_TABLE);
    const itemsByCategoryID = await app_cache.get(ITEMS_BY_CATEGORY_ID)
         
   
    var user = {} ;
    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;

    user = await JSON.parse(JSON.stringify(user)) ;
    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    
    userCart = await JSON.parse(JSON.stringify(userCart)) ;
    const items_array = await app_cache.get(ITEMS_ARRAY);
    
    
    var category = {} ;
    var index = -1;
    var categoryID = "";
    category_name = encode((new String(category_name)).toLocaleLowerCase());
    
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
        const humanFriendlyCategoryName = decode(category.category_name);
        if (categoryID in itemsByCategoryID) { 
            category_items = itemsByCategoryID[categoryID];
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
                items_array:items_array,
                userCart: userCart,
                user:user,
                IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
                category: decode(category.category_name),
                category_id: category.category_id,
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
        
    var userCart = {} ;
    var app_cache = request.locals.app_cache ;   
    //console.log(`app_cache["${CATEGORIES_TABLE}"]: ${JSON.stringify(app_cache.get(CATEGORIES_TABLE))}`); 
    const categories = await app_cache.get(CATEGORIES_TABLE);
         
    var userCart = {} ;
    var user = {} ;
    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    //const items_array = await app_cache.get(ITEMS_ARRAY);
    
    
    response.status(404).render('layout', 
    { 
        pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
        template: 'f404',
        category_items: categories,
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

