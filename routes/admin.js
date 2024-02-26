const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })
const {decode, encode} = require('html-entities');
require('dotenv').config();
const createError = require('http-errors');
const {generateUniqueID, getCategoriesItems} = require('../database/controllers/database');

const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');
const { check,validationResult } = require('express-validator');
var mysql2 = require('mysql2');
const {getFakeCategoriesItems} = require('../utilities/fakedata');
const { fa } = require('@faker-js/faker');

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

module.exports = () => { 
    /* generate a pool of mysql connection  */
    var con = mysql2.createPool(defaultMySQLDBConnectorConfig);
    
    router.get('/', csrfProtection, async (request, response) => { 
        var categories = JSON.parse(JSON.stringify(request.session.categories));
    
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;

        var loggedInUser = {} ;

        //check if user is logged in
        if (request.session.user && request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`You are not authorized to access this page`);
        };

        response.render('layout', { 
            pageTitle: 'Dashboard', 
            template: 'admin', 
            csrfToken: request.csrfToken(),
            categories: categories,
            user: loggedInUser,
            userCart: userCart,
            decode: decode,
            encode: encode,
        });
    });

    router.post('/', csrfProtection,checkOutValidation, async(request, response) => {
        
        var loggedInUser = {} ;

        //check if user is logged in
        if (request.session.user != {}) {
            loggedInUser = JSON.parse(JSON.stringify(request.session.user)) ;
        } else {
            return response.status(401).send(`You are not authorized to access this page`);
        };
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
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
        /* generate a category_web id  that does not exist */
        var category_webid = await generateUniqueID(con, 'category_items', 'category_webid');
        category_webid = category_webid.substring(0,8);
        try {
            var sql = `INSERT INTO category_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            var itemArray = [item_id, itemName, description, category_id, category_webid, '', quantityAvailable, unitPrice]; 
            await con.execute(sql,itemArray, 
                async(err, results,fields) => {
                    if (err) {
                        console.error("Error inserting category_items, reverting changes: ", err);
                        con.execute('ROLLBACK');//con.rollback();
                        throw err ;
                        
                    };
            });

            con.execute('COMMIT'); //await con.commit();
            
            
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
