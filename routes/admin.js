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

            /* update session variables */
            items_array.push(itemArray);
            if (!(item_id in itemsByID)) {
                itemsByID[item_id] = {} ;  
            } ;
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
            if (request.session.itemsByCategoryID && category_id in request.session.itemsByCategoryID) {
                categoryItems = JSON.parse(JSON.stringify(request.session.itemsByCategoryID[category_id]));
                return  response.status(200).json(categoryItems);
            } else {
                return  response.status(401).json(fakeCategoryItems);
            } ;
        } ;   

    });
    

    return router;
};
