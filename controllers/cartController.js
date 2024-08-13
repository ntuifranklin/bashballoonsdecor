const {decode, encode} = require('html-entities');
const {
    CATEGORIES_TABLE,
    USER_CART,
    USER,
    IMG_DIR_FOR_WEB,
    ITEMS_BY_ID,
    ITEMS_DETAILS,
    QUANTITY
} = require('../utilities/web_page_variables');

const cartPage = async (request, response) => { 
    
    
    var app_cache = request.locals.app_cache ;   
    const categories = await app_cache.get(CATEGORIES_TABLE);
         
    var userCart = {} ;
    var user = {} ;
    if (app_cache.has(USER))
        user = await app_cache.get(USER) ;

    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    
    response.render('layout', { 
        pageTitle: 'Your Shopping Cart', 
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
    
    var app_cache = request.locals.app_cache ;   
    var userCart = {} ;

    if (app_cache.has(USER_CART)) {
        
        userCart = await app_cache.get(USER_CART);
        userCart = await JSON.parse(JSON.stringify(userCart));
    } ;
    
    let itemsHashOnly ;
    if (app_cache.has(ITEMS_BY_ID)){
        itemsHashOnly = await app_cache.get(ITEMS_BY_ID) ;
        itemsHashOnly = JSON.parse(JSON.stringify(itemsHashOnly)) ;
    }
    
    const itemUpdateID = request.body.itemUpdateID;
    const addQuantity = 'a';
    const subtractQuantity = 's';
    const removeItem = 'r';
    const validActions = [addQuantity, subtractQuantity, removeItem];
    const action = request.body.action;
    if (!validActions.includes(action)) {
        response.status(400).send({ message: 'error', responseText: 'Invalid action' });
        return;
    } ;

    if (!( itemUpdateID in userCart)) {
        userCart[itemUpdateID] = {
        
        } ;   
    } ;

    if (!(QUANTITY in userCart[itemUpdateID])) {
        userCart[itemUpdateID][QUANTITY] = 0;
    } ;

    var itemDetails = null ;
    if (! (ITEMS_DETAILS in userCart[itemUpdateID])) {
        userCart[itemUpdateID][ITEMS_DETAILS] = {} ;
    } ;

    itemDetails = await JSON.parse(JSON.stringify(itemsHashOnly[itemUpdateID])) ;
    
    userCart[itemUpdateID][ITEMS_DETAILS] = itemDetails[ITEMS_DETAILS] ;

    /* update quantity and save session */
    if (action == subtractQuantity) {
        if (userCart[itemUpdateID][QUANTITY] < 1 ) {
            response.status(400).send({ message: 'error', responseText: 'Item not in cart' });
            
        } else if (userCart[itemUpdateID][QUANTITY] == 1) {
            delete userCart[itemUpdateID];
            await app_cache.set(USER_CART, JSON.parse(JSON.stringify(userCart))) ;
          
            response.status(200).send({ message: 'success', responseText: 'Item removed from cart' });
          
        } else {
            userCart[itemUpdateID][QUANTITY] -= 1;
            await app_cache.set(USER_CART, JSON.parse(JSON.stringify(userCart))) ;
            response.status(200).send({ message: 'success', responseText: 'Item removed from cart' });
        }
    
    } else {
        //console.log(`Successfully added to cart : ${JSON.stringify(userCart)}`);
        userCart[itemUpdateID][QUANTITY] += 1;
        await app_cache.set(USER_CART, JSON.parse(JSON.stringify(userCart))) ;
        response.status(200).send({ message: 'success', responseText: 'Item added to cart' });
    };
} ;

const cartPageUpdate = async (request, response) => {
         
    var app_cache = request.locals.app_cache ;   
    var userCart = {} ;
    if (app_cache.has(USER_CART)) {
        userCart = await app_cache.get(USER_CART);
        userCart = await JSON.parse(JSON.stringify(userCart)) ;
    } else {
        response.status(400).send({ message: 'error', responseText: "You don't have a cart yet" });
        return; 
    } ;
    var itemsByID = await app_cache.get(ITEMS_BY_ID);
    itemsByID = await JSON.parse(JSON.stringify(itemsByID));
    var itemsHashOnly =  JSON.parse(JSON.stringify(itemsByID))  ;
    
    const itemID = new String(request.body.itemID);

    if (itemsHashOnly == null || !(itemID in itemsHashOnly) ) {
        response.status(400).send({ message: 'error', responseText: 'Item not found' });
        return;
    };
    const updatedQuantity = new String(request.body.updatedQuantity);
    var integerQuantity = parseInt(updatedQuantity);

    if(isNaN(integerQuantity) || integerQuantity < 0) {
        response.status(400).send({ message: 'error', responseText: 'Invalid quantity' });
        return;
    }
    
    if (!( itemID in userCart)) {
        userCart[itemID] = {
           
        } ;   
    }
    
    if (!(QUANTITY in userCart[itemID])) {
       userCart[itemID][QUANTITY] = 0;
    } ;
    
    if (! (ITEMS_DETAILS in userCart[itemID])) {
        userCart[itemID][ITEMS_DETAILS] = {} ;
        var itemDetails = null ;
        itemDetails = JSON.parse(JSON.stringify(itemsHashOnly[itemID])) ;
        //console.log(`itemDetails : ${JSON.stringify(itemDetails)}`);
        userCart[itemID][ITEMS_DETAILS] = itemDetails[ITEMS_DETAILS] ;
    } ;

     /* update quantity and save session */
    userCart[itemID][QUANTITY] = integerQuantity ;
    app_cache.set(USER_CART, JSON.parse(JSON.stringify(userCart))) ;
    response.status(200).send({ message: 'success', responseText: `Cart updated successfully` });
} ;
const deleteCartItemPost = async (request, response) => {
         
    var app_cache = request.locals.app_cache;
    var userCart = {} ;
    if (app_cache.has(USER_CART))
        userCart = await app_cache.get(USER_CART);
    userCart = JSON.parse(JSON.stringify(userCart));

    const itemID = new String(request.body.itemID);

     /* update cart save session */
    delete userCart[itemID] ;
    await app_cache.set(USER_CART, JSON.parse(JSON.stringify(userCart)))  ;
    
    return response.status(200).send({ message: 'success', responseText: `Item deleted from cart successfully` });
} ;
module.exports = {
    cartPage, 
    cartPagePost,
    cartPageUpdate,
    deleteCartItemPost
} ;