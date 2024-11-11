const {decode, encode} = require('html-entities');
const {
    ADD_CART_QUANTITY,
    SUBTRACT_CART_QUANTITY,
    REMOVE_CART_ITEM,
    CATEGORIES_TABLE,
    USER_CART,
    USER,
    IMG_DIR_FOR_WEB,
    ITEMS_BY_ID,
    ITEMS_DETAILS,
    QUANTITY
} = require('../utilities/web_page_variables');

const {
    writeDataToRedisCache, 
    deleteDataFromRedisCache,
    REDIS_DEFAULT_CACHING_OPTIONS
} =  require('../middleware/redis');
const {MySQLDBConnector} = require('../database/models/MySQLDBConnector');

const cartPage = async (request, response) => { 
    
    
    var app_cache = request.locals.app_cache ;   
    const categories = await app_cache.get(CATEGORIES_TABLE);
         
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
    
    response.render('layout', { 
        pageTitle: 'Your Wish List', 
        template: 'cart', 
        userCart: userCart,
        user:user,
        csrfToken: request.csrfToken(),
        IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
        categories: categories,
        decode:decode,
        encode:encode
    });
} ;

const cartPagePost = async (request, response) => {
    
    
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
    
    
    const itemUpdateID = request.body.itemUpdateID;
    const addQuantity = ADD_CART_QUANTITY;
    const subtractQuantity = SUBTRACT_CART_QUANTITY;
    const removeItem = REMOVE_CART_ITEM;
    const validActions = [addQuantity, subtractQuantity, removeItem];
    const action = request.body.action;
    /*Grab stuffs from database */
    
    
    const selectsql = `
        SELECT * 
        FROM category_items WHERE item_id = ?
        `;
    const params = [itemUpdateID] ;
    //console.log(`category_id: ${categoryID}, category_weburl: ${category_weburl}`);
    
    //console.log(`Running sql ${selectsql}`);
    var the_item_to_update = await MySQLDBConnector.execute(selectsql, params)  ;

    if (!validActions.includes(action)) {
        response.status(400).send({ message: 'error', responseText: 'Invalid action' });
        return;
    } ;

    if (!( itemUpdateID in Object.keys(userCart))) {
        userCart[itemUpdateID] = {
        
        } ;   
    } ;

    if (!(QUANTITY in Object.keys(userCart[itemUpdateID]))) {
        userCart[itemUpdateID][QUANTITY] = 0;
    } ;

    var itemDetails = null ;
    if (! (ITEMS_DETAILS in Object.keys(userCart[itemUpdateID]))) {
        //userCart[itemUpdateID][ITEMS_DETAILS] = {} ;
        userCart[itemUpdateID][ITEMS_DETAILS] = await JSON.parse(JSON.stringify(the_item_to_update[0])) ;
    } ;

    //userCart[itemUpdateID][ITEMS_DETAILS] = await JSON.parse(JSON.stringify(the_item_to_update[0])) ;
    //console.log(`item sent to cart : ${JSON.stringify(userCart[itemUpdateID][ITEMS_DETAILS])}`);
    
    
    const options = REDIS_DEFAULT_CACHING_OPTIONS ;
    
    const userCartNameVariable = request.locals.USER_CART_NAME ;
    const key = userCartNameVariable;
    

    /* update quantity and save session */
    if (action == subtractQuantity) {
        if (userCart[itemUpdateID][QUANTITY] < 1 ) {
            response.status(400).send({ message: 'error', responseText: 'Item not in wish list' });
            
        } else if (userCart[itemUpdateID][QUANTITY] == 1) {
            delete userCart[itemUpdateID];
            
            const data = JSON.stringify(userCart) ;
            
            await writeDataToRedisCache(key, data, options);
            
            
            request.locals.USER_CART = userCart ;
            response.status(200).send({ message: 'success', responseText: 'Item removed from wish list' });
          
        } else {
            userCart[itemUpdateID][QUANTITY] -= 1;
            const data = JSON.stringify(userCart) ;
            await writeDataToRedisCache(key, data, options);
            
            request.locals.USER_CART = userCart ;
            response.status(200).send({ message: 'success', responseText: `Item quantity reduced to ${JSON.parse(JSON.stringify(userCart[itemUpdateID][QUANTITY]))} in wishlist` });
        }
    
    } else {
        //console.log(`Successfully added to cart : ${JSON.stringify(userCart)}`);
        userCart[itemUpdateID][QUANTITY] += 1;
        const data = JSON.stringify(userCart) ;
        await writeDataToRedisCache(key, data, options);
        var responseText = "";
        if (userCart[itemUpdateID][QUANTITY] == 1) {
            responseText="Item added to wish list" ;
        } else {
            
            responseText=`Item quantity increased to ${userCart[itemUpdateID][QUANTITY]}` ;
        } ;
        
        request.locals.USER_CART = userCart ;
        response.status(200).send({ message: 'success', responseText: responseText });
    };
    
} ;

const cartPageUpdate = async (request, response, next) => {
         
     
    var userCart = request.locals.USER_CART ;
    userCart = JSON.parse(JSON.stringify(userCart));
    if (!userCart) {
        response.status(400).send({ message: 'error', responseText: "You don't have a wish list yet" });
        next(); 
    } 

   
    //console.log(`current cart before update: ${JSON.stringify(userCart)}`);
    const itemUpdateID = new String(request.body.itemID);

    const updatedQuantity = new String(request.body.updatedQuantity);
    var integerQuantity = parseInt(updatedQuantity);

    if(isNaN(integerQuantity) || integerQuantity < 0) {
        response.status(400).send({ message: 'error', responseText: 'Invalid quantity' });
        return;
    }
    
    if (!( itemUpdateID in userCart)) {
        response.status(400).send({ message: 'error', responseText: 'Error occured' });
        return;  
    }
    
    if (!(QUANTITY in userCart[itemUpdateID])) {
        response.status(400).send({ message: 'error', responseText: 'Error occured' });
        return;
    } ;
    
    if (! (ITEMS_DETAILS in userCart[itemUpdateID])) {
        response.status(400).send({ message: 'error', responseText: 'Error occured' });
        return;
    } ;

     /* update quantity and save session */
    userCart[itemUpdateID][QUANTITY] = integerQuantity ;
    const options = REDIS_DEFAULT_CACHING_OPTIONS ;
    
    const userCartNameVariable = request.locals.USER_CART_NAME ;
    const key = userCartNameVariable;
    
    const data = JSON.stringify(userCart) ;
    await writeDataToRedisCache(key, data, options);
    request.locals.USER_CART = userCart ;
    //console.log(`current cart after update: ${JSON.stringify(userCart)}`);
    response.status(200).send({ message: 'success', responseText: `Wish list updated successfully` });
} ;
const deleteCartItemPost = async (request, response) => {
         
     
    var userCart = request.locals.USER_CART ;
   
    userCart = await JSON.parse(JSON.stringify(userCart));
    if (!userCart) {
        response.status(400).send({ message: 'error', responseText: "You don't have a wish list yet" });
        next(); 
    } 

    const itemID = new String(request.body.itemID);

     /* update cart save session */
    delete userCart[itemID] ;
    const options = REDIS_DEFAULT_CACHING_OPTIONS ;
    
    const userCartNameVariable = request.locals.USER_CART_NAME ;
    const key = userCartNameVariable;
    
    const data = JSON.stringify(userCart) ;
    await writeDataToRedisCache(key, data, options);
    request.locals.USER_CART = userCart ;
    
    return response.status(200).send({ message: 'success', responseText: `Item deleted from wish list successfully` });
} ;
module.exports = {
    cartPage, 
    cartPagePost,
    cartPageUpdate,
    deleteCartItemPost
} ;