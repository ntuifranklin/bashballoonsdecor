

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
const {getCategoriesItems} = require('../database/controllers/database');

const viewRentalItemDetailsPage = async(request, response) => { 
   
    //Send to product-details page the item and all items in the same category
    var item_category_webid = new String(request.params.item_category_webid);
    var all_categories_items = await getCategoriesItems();
    //console.log(`${JSON.stringify(uniqueCategoryItem)}`);
    //console.log(`Category Name Encoded : ${category_name}`);
    var userCart = {} ;
    var user = {} ;
    var app_cache = request.locals.app_cache ;   
    //console.log(`app_cache["${CATEGORIES_TABLE}"]: ${JSON.stringify(app_cache.get(CATEGORIES_TABLE))}`); 
    let categories = await app_cache.get(CATEGORIES_TABLE);
    
    categories = JSON.parse(JSON.stringify(categories));
    //itemsByCategoryID = JSON.parse(JSON.stringify(itemsByCategoryID));

    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;
    user = await JSON.parse(JSON.stringify(user)) ;

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    
    userCart = await JSON.parse(JSON.stringify(userCart)) ;
    //itemsByCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID)) ;
    
    //itemsByCategoryWebID = await app_cache.get(ITEMS_BY_CATEGORY_WEB_ID);
    //itemsByCategoryWebID = await JSON.parse(JSON.stringify(itemsByCategoryWebID)) ;
    
    let  item = null ;
    var categorywebIDFound = false ;
    var one_category_item = null ;
    var index = -1;
    var catwebid = null ;
    var catid = null ;
    
    for(let i=0; i < all_categories_items.length; i++) {
        one_category_item = JSON.parse(JSON.stringify(all_categories_items[i]));
        catwebid = JSON.parse(JSON.stringify(one_category_item.category_webid));
        catwebid = catwebid.toLocaleLowerCase();
        if (catwebid === item_category_webid) {
            categorywebIDFound = true;
            index = i;
            break;
        }


    }
    if (!categorywebIDFound || index == -1) {
        response.redirect(`/${F404_ROUTE}`);
        return ;
    };
    let itemsByCategoryID = {};
    let category_item;
    //loop again this time to get all items in the same category
    
    for(let i=0; i < all_categories_items.length; i++) {
        category_item = JSON.parse(JSON.stringify(all_categories_items[i]));
        catid = JSON.parse(JSON.stringify(category_item.category_id));
        catid = catid.toLocaleLowerCase();
        if (catid === one_category_item.category_id && one_category_item.item_id != one_category_item.item_id) {
            itemsByCategoryID[catid] = JSON.parse(JSON.stringify(category_item));
            
        }


    }
    item = await JSON.parse(JSON.stringify(one_category_item)) ;

    const itemTitle = decode(item.item_name) ;
    const item_category_id = item.category_id ;
    const itemsWithSimilarCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID));

    //find the category name of the category to which this item belongs to.
    var category = one_category;
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
    var category_name = decode(category.category_name) ;
            
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
        itemsWithSimilarCategoryID: itemsWithSimilarCategoryID,
        item_category_name: category_name,
        seoObject:seoObject
    });
} ;

exports.viewRentalItemDetailsPage = viewRentalItemDetailsPage;