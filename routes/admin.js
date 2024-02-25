const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })

require('dotenv').config();
const createError = require('http-errors');
const {generateUniqueID, getCategoriesItems} = require('../database/controllers/database');

const { check,validationResult } = require('express-validator');
var mysql2 = require('mysql2');

const checkOutValidation = [
    check('itemName').isLength({ min: 3, max:255}).escape().notEmpty().withMessage('Please enter the item name.'),
    check('description').isLength({ min: 3, max:1024 }).escape().notEmpty().withMessage('Please enter the item description.'),
    check('quantityAvailable').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a quantity'),
    check('category_id').isLength({ min: 1 }).escape().isAlphanumeric().withMessage('Please select a category'),
    check('unitPrice').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a price')
];

module.exports = () => { 
    /* generate a pool of mysql connection  */
    var con = mysql2.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_UPGRADED_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle: 4, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
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
                        await con.execute('ROLLBACK');//con.rollback();
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


    router.get('/', csrfProtection, async (request, response) => { 
        var categories = request.session.categories;
    
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
            user: loggedInUser
        });
    });
    
    router.get('/:category_id', async (request, response) => { 
        
        var category_id = new String(request.params.category_id);
        var categoryItems = await getCategoriesItems(con,tableName='category_items', category_id=category_id);
        categoryItems = JSON.parse(JSON.stringify(categoryItems));
        //console.log(`Category id: ${category_id}`);
        //console.log(`Category items: ${JSON.stringify(categoryItems)}`);
        response.json(categoryItems);
    });

    return router;
};
