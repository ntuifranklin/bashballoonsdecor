const express = require('express');
const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true }) ;
const {fileuploads} = require('../utilities/fileupload');
const router = express.Router();
const {decode, encode} = require('html-entities');
require('dotenv').config();
const createError = require('http-errors');
const {generateUniqueID, getCategoriesItems} = require('../database/controllers/database');

const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');
const { check,validationResult } = require('express-validator');
var mysql2 = require('mysql2');
const {getFakeCategoriesItems,getFakeEmailObject} = require('../utilities/fakedata');
const { fa } = require('@faker-js/faker');
const {Email} = require('../utilities/email');
const { file } = require('googleapis/build/src/apis/file');


/* For caching data to increase speed */
const NodeCache = require( "node-cache" );
const cache = new NodeCache();

const checkOutValidation = [
    check('itemName').isLength({ min: 3, max:255}).escape().notEmpty().withMessage('Please enter the item name.'),
    check('description').isLength({ min: 3, max:1024 }).escape().notEmpty().withMessage('Please enter the item description.'),
    check('quantityAvailable').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a quantity'),
    check('category_id').isLength({ min: 1 }).escape().isAlphanumeric().withMessage('Please select a category'),
    check('unitPrice').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a price')
];

/* The varibale below is just a replica for the above */
const itemUpdateCheckValidation = [
    check('itemName').isLength({ min: 3, max:255}).escape().notEmpty().withMessage('Please enter the item name.'),
    check('description').isLength({ min: 3, max:1024 }).escape().notEmpty().withMessage('Please enter the item description.'),
    check('quantityAvailable').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a quantity'),
    check('unitPrice').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a price')
];

const apiCheckValidation = [
    check('category_id').isLength({ min: 1 }).escape().isAlphanumeric().withMessage('Please select a category')
];

//image directory for item images relative to the /routes directory
const IMG_DIR = __dirname + "/" + "../static_template/assets/img/itemimgs/";

module.exports = () => { 
    /* generate a pool of mysql connection  */
    var con = mysql2.createPool(defaultMySQLDBConnectorConfig);
    
    router.get('/', csrfProtection, async (request, response) => { 
        

        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
        }
         
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;

        var loggedInUser = {} ;

        //check if user is logged in
        if (request.session.user && request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`Go Away !!!`);
        };

        response.render('layout', { 
            pageTitle: 'Dashboard', 
            template: 'admin', 
            categories: categories,
            user: loggedInUser,
            userCart: userCart,
            IMG_DIR_FOR_WEB:request.session.IMG_DIR_FOR_WEB,
            csrfToken: request.csrfToken(),
            decode: decode,
            encode: encode,
        });
    });

    router.post('/',csrfProtection, checkOutValidation, async(request, response) => {
        
        var loggedInUser = {} ;
        //check if user is logged in
        if (request.session.user && request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`Go Away !!!`);
        };

        //console.log(`Before checking the files array length`);
        if (!request.files || Object.keys(request.files).length === 0) {
            return response.status(400).send('No image was uploaded.');
        } ;
        //.log(`\nChecked the files array successful\nChecking the image type`);
        /* check the mimetype of the file */
        var acceptedImageTypes = /^jpeg|jpg|png|gif$/;
        var correct_mimetype = acceptedImageTypes.test(request.files.itemimgurl.mimetype);
        if (!correct_mimetype) {
            console.log(`Error uploaded wrong file`);
            return response.status(400).send(`Only images of this type ${acceptedImageTypes} are accepted`);
        }
        
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            return response.status(400).send(`${JSON.parse(JSON.stringify(err_message))}`); 
        };
        
        
        var itemName = new String(request.body.itemName);
        var description = new String(request.body.description);
        var unitPrice = new String(request.body.unitPrice) ;
        var quantityAvailable = new String(request.body.quantityAvailable);
        var category_id = new String(request.body.category_id);
        
        // Start Transaction
        con.execute('START TRANSACTION');
        /* generate an item_id that does not exist */
        var item_id = await generateUniqueID(con, 'category_items', 'item_id');
        item_id = item_id.substring(0,16);
        /* rename the image url to have the id as part of the image */
        //console.log(`current directory name  : ${__dirname}`);
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        const sampleFile = request.files.itemimgurl;
        const uploadPath = `${IMG_DIR}` + item_id + '-' + sampleFile.name;

        // Use the mv() method to place the file somewhere on your server
        sampleFile.mv(uploadPath, function(errMoveImg) {
            if (errMoveImg) {
                console.log(`Error moving image : ${errMoveImg}`);
                return response.status(500).send(errMoveImg);

            }

            //response.send('File uploaded!');
        });
        const imageurl = item_id + '-' + sampleFile.name;
        /* generate a category_web id  that does not exist */
        var category_webid = await generateUniqueID(con, 'category_items', 'category_webid');
        category_webid = category_webid.substring(0,8);
        try {
            var sql = `INSERT INTO category_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            var itemArray = [item_id, itemName, description, category_id, category_webid, imageurl, quantityAvailable, unitPrice]; 
            con.execute(sql,itemArray, 
                (errInsertingItem, results,fields) => {
                if (errInsertingItem) {
                    console.error("Error inserting category_items, reverting changes: ", errInsertingItem);
                    con.execute('ROLLBACK');//con.rollback();
                    throw errInsertingItem ;
                    
                };
            });

            con.execute('COMMIT'); //await con.commit();
            /* get session array variables */
                    
            var items_array = JSON.parse(JSON.stringify(request.session.items_array)) ;
            var itemsByID = JSON.parse(JSON.stringify(request.session.itemsByID));
            /* itemsByCategoryID should be an array  */
            var itemsByCategoryID = JSON.parse(JSON.stringify(request.session.itemsByCategoryID));
            var itemsByCategoryWebID = JSON.parse(JSON.stringify(request.session.itemsByCategoryWebID)) ;

            //console.log(`itemsByCategoryID: ${JSON.stringify(itemsByCategoryID)}`);

            const itemObjectJson = {
                "item_id" : item_id,
                "item_name":itemName,
                "description":description,
                "category_id":category_id,
                "category_webid":category_webid,
                "imageurl":imageurl,
                "quantityAvailable":quantityAvailable,
                "unitPrice":unitPrice
            } ;
            /* update session variables */
            items_array.push(itemObjectJson);
            if (!(item_id in itemsByID)) {
                itemsByID[item_id] = {} ;  
            } ;
            itemsByID[item_id]["itemDetails"] = JSON.parse(JSON.stringify(itemObjectJson)) ;

            
            if (!(category_id in itemsByCategoryID)) {
                itemsByCategoryID[category_id] = [] ;  
            } ;
            itemsByCategoryID[category_id].push(itemObjectJson);
            
            if (!(category_webid in itemsByCategoryWebID)) {
                itemsByCategoryWebID[category_webid] = {} ;  
            } ;
            itemsByCategoryWebID[category_webid] = JSON.parse(JSON.stringify(itemObjectJson));

            request.session.items_array = JSON.parse(JSON.stringify(items_array)); 
            request.session.itemsByID = JSON.parse(JSON.stringify(itemsByID)) ;
            request.session.itemsByCategoryID = JSON.parse(JSON.stringify(itemsByCategoryID));
            request.session.itemsByCategoryWebID = JSON.parse(JSON.stringify(itemsByCategoryWebID));

            request.session.save();
            
            return response.status(200).send(`Item added to cart successfully`);
        } catch (error) {
            console.log(`Error in admin.js inserting new item: ${error.message}`);
            con.execute('ROLLBACK');//con.rollback();
            return response.status(500).send(`Error processing form`);
        }
        
    });

    /* this route below enables the 
    admin to send a post request with the category_id, 
    and returns all items belonging to the category with that same category_id.
    If the category_id does no exist, send back a bunch of fake category items generated with fakerjs package
    The fake data will look in structure just like the original
    */
    router.post('/category_items', csrfProtection, apiCheckValidation,async (request, response) => { 
        
        var category_id = new String(request.body.category_id);
        var categoryItems = [] ;
        var fakeCategoryItems = await getFakeCategoriesItems() ;
        fakeCategoryItems = JSON.parse(JSON.stringify(fakeCategoryItems));
        var loggedInUser = {} ;
        var errorCode = 200 ;
        //console.log(`fake data generated : ${JSON.stringify(fakeCategoryItems, null, 4)}`);
        //check if user is logged in
        if (!request.session.user) {
            //console.log("User is not logged in. Might be a bot trying to access this route. Generating fake data for this bot to eat");
           
            errorCode = 401 ;
            return response.status(401).json(fakeCategoryItems);
        } else {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
            var itemsByCategoryID = cache.get('itemsByCategoryID');
            if (!itemsByCategoryID) {
                itemsByCategoryID = JSON.parse(JSON.stringify(request.session.itemsByCategoryID)) ;
                cache.set('itemsByCategoryID',itemsByCategoryID);
            }
            if (category_id in itemsByCategoryID) {
                
                categoryItems = JSON.parse(JSON.stringify(itemsByCategoryID[category_id]));
                return  response.status(200).json(categoryItems);
               
            } else {
                return  response.status(401).json(fakeCategoryItems);
            }

        } ;   

    });
    
    router.post('/updateitem/',csrfProtection, itemUpdateCheckValidation, async(request, response) => {
        /* A non logged in user cannot access this page */
        var loggedInUser = {} ;
        //check if user is logged in
        if (request.session.user && request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`Go Away !!!`);
        };

        var category_webid = new String(request.body.category_webid) ;
        
        var itemsByCategoryWebID = cache.get('itemsByCategoryWebID');
        if (!itemsByCategoryWebID) {
            itemsByCategoryWebID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryWebID)) ;
            cache.set('itemsByCategoryWebID',itemsByCategoryWebID);
        };
         
        if (!(category_webid in itemsByCategoryWebID)) {
            console.log(`Posting to /admin/updateitem/ with category_webid : ${category_webid}. \n
             This category_webid was not found`);
            return response.status(401).send(`An error occured`);
        }
        /* get cached or session array variables if necessary */
        var itemsByID = cache.get('itemsByID');
        /* We will be using caches because we want to speed up stuffs  */
        if (!itemsByID) {
            itemsByID = await JSON.parse(JSON.stringify(request.session.itemsByID)) ;
            cache.set('itemsByID',itemsByID);

        } ;
        
        var item_id = "";
        var item_name = new String(request.body.itemName);
        var description = new String(request.body.description);
        var unitPrice = new String(request.body.unitPrice) ;
        var quantityAvailable = new String(request.body.quantityAvailable);
        
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            return response.status(400).send(`${JSON.parse(JSON.stringify(err_message))}`); 
        };

        /* An item gets updated if its old value is different from its new value */
        var oldItem = JSON.parse(JSON.stringify(itemsByCategoryWebID[category_webid]));
        item_id = new string(oldItem.item_id) ;
        var category_id = new String(oldItem.category_id);
        

        var itemsByCategoryID = cache.get('itemsByCategoryID');
        if (!itemsByCategoryID) {
            itemsByCategoryID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryID)) ;
            cache.set('itemsByCategoryID',itemsByCategoryID);
            
        };
         
        
        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
            
        }

        /* 
            For the item image we just update the image in case an image was uploaded 
            We will not deal with checking if the file name is the same or is different.
        */
        var imageurl = oldItem.imageurl;
        //console.log(`Before checking the files array length`);
        if (request.files && Object.keys(request.files).length != 0) {
            //.log(`\nChecked the files array successful\nChecking the image type`);
            /* check the mimetype of the file */
            var acceptedImageTypes = /^jpeg|jpg|png|gif$/;
            var correct_mimetype = acceptedImageTypes.test(request.files.itemimgurl.mimetype);
            if (!correct_mimetype) {
                console.log(`Error uploaded wrong file`);
                return response.status(400).send(`Only images of this type ${acceptedImageTypes} are accepted`);
            } ;
                
            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            const sampleFile = request.files.itemimgurl;
            const uploadPath = `${IMG_DIR}` + oldItem.item_id + '-' + sampleFile.name;

            
            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(uploadPath, function(errMoveImg) {
                if (errMoveImg) {
                    console.log(`Error moving image : ${errMoveImg}`);
                    return response.status(500).send(errMoveImg);
                }

                //response.send('File uploaded!');
            });
            imageurl = item_id + '-' + sampleFile.name;
        } ;
        
        
         
        /* Updates are done in transaction mode.
        Below we update just the fields that changed 
        */
        // Start Transaction
        con.execute('START TRANSACTION');
       
        try {
            /* multiple or no updates might take place */
            var queries = []; //ana array of strings
            var values = []; // has to be an array of arrays
            
            /* Use of encode and decode for html-entities. 
             If you do not remeber what html entities are, then just google it.
            */
            if (decode(oldItem.item_name) != decode(item_name) ) {
                queries.push(`UPDATE category_items SET item_name = ? WHERE item_id=?`);
                values.push([encode(item_name), oldItem.item_id]);
            } ;
            
            if (decode(oldItem.description) != decode(description) ) {
                queries.push(`UPDATE category_items SET description = ? WHERE item_id=?`);
                values.push([encode(description), oldItem.item_id]);
            } ;
            
            if (oldItem.quantityAvailable != quantityAvailable ) {
                queries.push(`UPDATE category_items SET quantityAvailable = ? WHERE item_id=?`);
                values.push([quantityAvailable, oldItem.item_id]);
            } ;

            
            if (oldItem.unitPrice != unitPrice ) {
                queries.push(`UPDATE category_items SET unitPrice = ? WHERE item_id=?`);
                values.push([unitPrice, oldItem.item_id]);
            } ;

            
            for (var k = 0; k < queries.length; k++) {
                var query = queries[k];
                var data = values[k];
                console.log(`Executing query: ${query} with params: ${data}`);
                await con.execute(query, data, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        //con.execute('ROLLBACK');
                        throw new Error(error);
                    } 
                });
            }
            

            con.execute('COMMIT'); //await con.commit();

            console.log('Commit was successful');
            /* Now update caches */

            const itemObjectJson = {
                "item_id" : item_id,
                "item_name":item_name,
                "description":description,
                "category_id":category_id,
                "category_webid":category_webid,
                "imageurl":imageurl,
                "quantityAvailable":quantityAvailable,
                "unitPrice":unitPrice
            } ;
            /* update cache and or session variables */
            var items_array = cache.get('items_array');
            if (!items_array) {
                items_array = JSON.parse(JSON.stringify(request.session.items_array));
                cache.set('items_array', items_array);
            }
            /* find old item in array and get rid of it */
            var indexToDelete = -1 ;
            for (var j=0 ; j < items_array.length; j++) {
                var arrayItem = JSON.parse(JSON.stringify(items_array[j]));
                if (arrayItem.item_id == oldItem.item_id) {
                    indexToDelete = j ;
                    break ;
                }
            } ;
            if (indexToDelete >= 0 && indexToDelete < items_array.length) {
                items_array.splice(indexToDelete,indexToDelete);
            } ;

            items_array.push(itemObjectJson);
            if (!(item_id in itemsByID)) {
                itemsByID[item_id] = {} ;  
            } ;
            itemsByID[item_id]["itemDetails"] = JSON.parse(JSON.stringify(itemObjectJson)) ;

            
            if (!(category_id in itemsByCategoryID)) {
                itemsByCategoryID[category_id] = [] ;  
            } ;

            var itemsByCategoryIDIndexToDelete = -1;
            for (var i=0 ; i <  itemsByCategoryID[category_id].length; i++) {
                var arrayItem = JSON.parse(JSON.stringify(itemsByCategoryID[category_id][i]));
                if (arrayItem.item_id == oldItem.item_id) {
                    itemsByCategoryIDIndexToDelete  = i ;
                    break ;
                }
            } ;

            itemsByCategoryID[category_id].splice(itemsByCategoryIDIndexToDelete, itemsByCategoryIDIndexToDelete);
            itemsByCategoryID[category_id].push(itemObjectJson);
            
            if (!(category_webid in itemsByCategoryWebID)) {
                itemsByCategoryWebID[category_webid] = {} ;  
            } ;
            itemsByCategoryWebID[category_webid] = JSON.parse(JSON.stringify(itemObjectJson));
            
            cache.set('categories', categories);
            cache.set('items_array',items_array);
            cache.set('itemsByCategoryID',itemsByCategoryID);
            cache.set('itemsByCategoryWebID',itemsByCategoryWebID);

            request.session.items_array = JSON.parse(JSON.stringify(items_array)); 
            request.session.itemsByID = JSON.parse(JSON.stringify(itemsByID)) ;
            request.session.itemsByCategoryID = JSON.parse(JSON.stringify(itemsByCategoryID));
            request.session.itemsByCategoryWebID = JSON.parse(JSON.stringify(itemsByCategoryWebID));

            request.session.save();
            
            return response.status(200).send(`Item updated successfully`);
        } catch (error) {
            console.log(`Error in admin.js updating item: ${error.message}`);
            con.execute('ROLLBACK');//con.rollback();
            return response.status(500).send(`Error processing update item form`);
        }
        
    });

    
    router.get('/updateitem/:category_webid', csrfProtection, async (request, response) => { 
        
       
        var loggedInUser = {} ;

        //check if user is logged in
        if (request.session.user && request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`Go Away !!!`);
        };
        
        var itemsByCategoryWebID = cache.get('itemsByCategoryWebID');
        /* We will be using caches becausse we want to speed up stuffs  */
        if (!itemsByCategoryWebID) {
            itemsByCategoryWebID = await JSON.parse(JSON.stringify(request.session.itemsByCategoryWebID)) ;
            cache.set('itemsByCategoryWebID',itemsByCategoryWebID);

        } ;
        var category_webid = new String(request.params.category_webid);
        if (!(category_webid in itemsByCategoryWebID)) {
            console.log(`An update occured in ${__filename} with a category_webid that was not found in cache or session.`);
            return response.status(401).send(`An Error Occured`);
        };
        const itemToUpdate = JSON.parse(JSON.stringify(itemsByCategoryWebID[category_webid]));
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;

        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
        }

        response.render('layout', { 
            pageTitle: 'Dashboard', 
            template: 'updateitemform', 
            categories: categories,
            user: loggedInUser,
            userCart: userCart,
            item:itemToUpdate,
            IMG_DIR_FOR_WEB:request.session.IMG_DIR_FOR_WEB,
            csrfToken: request.csrfToken(),
            decode: decode,
            encode: encode,
        });
    });
    return router;
};
