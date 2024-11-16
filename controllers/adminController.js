

const {IMG_DIR_FOR_WEB,upload_folder, ABSOLUTE_PATH_TO_UPLOAD_FOLDER,template_folder} = require('../utilities/fileupload');
const {decode, encode} = require('html-entities');
require('dotenv').config();
const fs = require('fs');
const {generateUniqueID, getCategoriesItems} = require('../database/controllers/database');

const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');
const {Imageconverter} = require('../models/Imageconverter');
let imageConverter = new Imageconverter();
var mysql2 = require('mysql2');

const {
    readDataFromRedisCache
} =  require('../middleware/redis');
        
const { 
    CATEGORIES_TABLE,
    CATEGORY_ITEMS_TABLE,
    USER_CART, 
    USER, 
    ITEMS_DETAILS, 
    ITEMS_ARRAY, 
    ITEMS_BY_ID, 
    ITEMS_BY_CATEGORY_ID, 
    ITEMS_BY_CATEGORY_WEB_ID
} = require('../utilities/web_page_variables');
var IMG_DIR = upload_folder ;
const {ADMIN_ROUTE} = require('../utilities/routes_constant_names');
const { file } = require('googleapis/build/src/apis/file');
/* generate a pool of mysql connection  */

const {uploadImageToCloudFlare,deleteExistingImageFromCloudFlare} = require('../utilities/cloudflare_image_upload');
const displayAdminDashboardPage = async(request, response) => {

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
    response.render('layout', { 
        pageTitle: 'Admin Dashboard', 
        template: 'admin', 
        categories: categories,
        user: user,
        userCart: userCart,
        IMG_DIR_FOR_WEB: IMG_DIR_FOR_WEB,
        csrfToken: request.csrfToken(),
        decode: decode,
        encode: encode,
    });
} ;
var con = mysql2.createPool(defaultMySQLDBConnectorConfig);
const addItemPost = async(request, response) => {
    
      
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

    
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var sampleFile = request.files.itemimgurl;
    console.log(`sample file uploaded: ${JSON.stringify(sampleFile)}`);
    
    var ext = sampleFile.name.split('.').pop();
    var seoFriendlyImageLookingName = new String(request.body.itemName);
    //File name should be SEO friendly
    seoFriendlyImageLookingName = seoFriendlyImageLookingName.replace(/[^a-zA-Z0-9]+/g, "-");
    seoFriendlyImageLookingName = seoFriendlyImageLookingName + '.' + ext;
    //image directory for item images relative to the /routes directory
    const IMG_DIR = `${upload_folder}` ;
    
    const uploadPath = `${IMG_DIR}` + item_id + '.' + ext;
    //console.log(`Upload path: ${upload_folder}`);
    
    let imageurl = "";
    let item_image_json_object  ;
    let cloudflare_response ; 
    let cloudflare_image_id ;
    let filename ;
    let variants ;
    let variant_70x70;
    let variant_110x118 ;
    let variant_384x320 ;
    
    let insertImageSql ;
    let insertImageArray;
    try {
        // Save the file in the original format
        if (sampleFile != null ) {
            
            /*
            sampleFile.mv(uploadPath, function(errMoveImg) {
                if (errMoveImg) {
                    console.log(`Error moving image : ${errMoveImg.message}`);
                    
                    response.status(400).send('Error uploading image');
                    return ;
    
                }
    
                console.log('File uploaded!');
            });
            */
                        
            cloudflare_response  = await uploadImageToCloudFlare(
                imagePath=sampleFile.tempFilePath, 
                filename_for_cloudflare=seoFriendlyImageLookingName
            );
            cloudflare_response = await JSON.parse(JSON.stringify(cloudflare_response));
            //console.log(`Cloudflare response: ${JSON.stringify(cloudflare_response, null, 2)}`);
            item_image_json_object = cloudflare_response["result"];
            //console.log(`Result of cloudflare response: ${JSON.stringify(item_image_json_object, null, 2)}`);
            
            variants = await JSON.parse(JSON.stringify(item_image_json_object["variants"])); 
            //variants = await JSON.parse(JSON.stringify(variants)); 
            //console.log(`Accessing variants: ${JSON.stringify(variants, null, 2)}`);
            //console.log(`Variants.length: ${JSON.stringify(variants.length, null, 2)}`);
            
            
            filename = item_image_json_object["filename"];
            imageurl = variants[8];
            /*   
                `cloudflare_image_id` VARCHAR(64) NOT NULL,
                `item_id` VARCHAR(16) NOT NULL,
                `filename` VARCHAR(255) DEFAULT NULL,
                `variant_110x118` VARCHAR(264) DEFAULT NULL,
                `variant_384x320` VARCHAR(264) DEFAULT NULL,
                `variant_70x70` VARCHAR(264) DEFAULT NULL,
                `date_uploaded` DATETIME DEFAULT CURRENT_TIMESTAMP(),
                `date_modified` DATETIME DEFAULT CURRENT_TIMESTAMP(),
            */
            cloudflare_image_id = item_image_json_object["id"];
            
            for (let i=0 ; i < variants.length; i++) {
                let variant = variants[i] ;
                if (variant.includes("70x70"))
                    variant_70x70 = variants[i];
                else if (variant.includes("110x118"))
                    variant_110x118 = variants[i];
                else if (variant.includes("384x320"))
                    variant_384x320 = variants[i];
            }
            imageurl = variant_110x118 ;
            insertImageSql = "INSERT INTO category_items_images VALUES(?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())" ;
            insertImageArray = [
                cloudflare_image_id, 
                item_id,
                filename,
                variant_110x118,
                variant_384x320,
                variant_70x70
            ];
            
            //console.log(`variant_110x118: ${JSON.stringify(variant_110x118, null, 2)}`);
            //console.log(`variant_384x320: ${JSON.stringify(variant_384x320, null, 2)}`);
            //console.log(`variant_70x70: ${JSON.stringify(variant_70x70, null, 2)}`);
            
        }    
            
        /* generate a category_web id  that does not exist */
        var category_webid = await generateUniqueID(con, 'category_items', 'category_webid');
        category_webid = category_webid.substring(0,8);
        var sql = `INSERT INTO category_items VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())`;
        var itemArray = [
            item_id, 
            itemName, 
            description, 
            category_id, 
            category_webid, 
            imageurl, 
            quantityAvailable, 
            unitPrice
        ]; 
        con.execute(sql,itemArray, 
            (errInsertingItem, results,fields) => {
            if (errInsertingItem) {
                console.error("Error inserting category_items, reverting changes: ", errInsertingItem);
                con.execute('ROLLBACK');//con.rollback();
                throw errInsertingItem ;
            };
        });
        /* Insert into the images table the image data for this item we just uploaded */
        con.execute(insertImageSql,insertImageArray, 
            (errInsertingImage, results,fields) => {
            if (errInsertingImage) {
                console.error("Error inserting category_items_images, reverting changes: ", errInsertingImage);
                con.execute('ROLLBACK');//con.rollback();
                throw errInsertingImage ;
            };
        });

        //await deleteExistingImageFromCloudFlare(cloudflare_image_id);
        //con.execute('ROLLBACK'); //await con.commit();

        con.execute('COMMIT'); //await con.commit();
        
        const success_message = `Item added to category successfully<br/>\n
        <a href='/${ADMIN_ROUTE}'>Back to Admin Dashboard</a>
        ` ;
        //con.releaseConnection();
        return response.status(200).send(success_message);
        
    } catch (error) {
        console.log(`Error in ${__filename} inserting new item: ${error.message}`);
        con.execute('ROLLBACK');//con.rollback();
        //con.releaseConnection();
        deleteExistingImageFromCloudFlare(cloudflare_image_id);
        return response.status(400).send(`Error processing form`);
    } ;
    
} ;

const updateItemPost = async(request, response) => {
    
    var app_cache = request.locals.app_cache ; 
    var category_webid = new String(request.params.category_webid) ;
    var itemsByCategoryWebID = await app_cache.get(ITEMS_BY_CATEGORY_WEB_ID);
    itemsByCategoryWebID =  await JSON.parse(JSON.stringify(itemsByCategoryWebID)) ;
     
    /* get cached or session array variables if necessary */
    var itemsByID = await app_cache.get(ITEMS_BY_ID);
    itemsByID = await JSON.parse(JSON.stringify(itemsByID)) ;
    
    var item_id = "";
    var item_name = new String(request.body.itemName);
    var description = new String(request.body.description);
    var unitPrice = new String(request.body.unitPrice) ;
    var quantityAvailable = new String(request.body.quantityAvailable);
    
    /* An item gets updated if its old value is different from its new value */
    var oldItem = await JSON.parse(JSON.stringify(itemsByCategoryWebID[category_webid]));
    item_id = new String(oldItem.item_id) ;
    var category_id = new String(oldItem.category_id);
    

    var itemsByCategoryID = await app_cache.get(ITEMS_BY_CATEGORY_ID);
    itemsByCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID)) ;
             
    
    //var categories = await JSON.parse(JSON.stringify(request.session.categories));
   
    /* 
        For the item image we just update the image in case an image was uploaded 
        We will not deal with checking if the file name is the same or is different.
    */
    var imageurl = oldItem.imageurl;
    //console.log(`Before checking the files array length`);
    var sampleFile = null;
    var uploadPath = "";
    var fileWasUploaded = false ;
    if (request.files && Object.keys(request.files).length != 0) {
        //.log(`\nChecked the files array successful\nChecking the image type`);
        /* check the mimetype of the file */
        var acceptedImageTypes = /jpeg|jpg|png|gif/;
        var correct_mimetype = acceptedImageTypes.test(request.files.itemimgurl.mimetype);
        if (!correct_mimetype) {
            console.log(`Error uploaded wrong file`);
            return response.status(400).send(`Only images of this type ${acceptedImageTypes} are accepted`);
            
        } ;
           
    } ;
    
    // Start Transaction
    con.execute('START TRANSACTION');
    
    try {
        
        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = request.files.itemimgurl;
        if (sampleFile != null ) {
                
            sampleFile = request.files.itemimgurl;
            //get extension of the file 
            var ext = sampleFile.name.split('.').pop();
            
            IMG_DIR = __dirname + '/../' +  template_folder + IMG_DIR_FOR_WEB ;
            uploadPath = `${IMG_DIR}` + item_id + '.' + ext;

            imageurl = "";
            // Use the mv() method to place the file somewhere on your server
            sampleFile.mv(uploadPath, function(errMoveImg) {
                if (errMoveImg) {
                    console.log(`Error moving image : ${errMoveImg}`);
                    return response.status(500).send('Error uploading image');
                } else {
                    fileWasUploaded = true ;
                }

            });
            //try saving the image to a specified folder   
            
            imageurl = await imageConverter.convert(request.files.itemimgurl, item_id);
            console.log(`new image name : ${imageurl}, old image name: ${oldItem.imageurl}`);
    
        }
        /* multiple or no updates might take place */
        var queries = []; //ana array of strings
        var values = []; // has to be an array of arrays
        
        /* Use of encode and decode for html-entities. 
         If you do not remeber what html entities are, then just google it.
        */
        if (decode(oldItem.item_name) != decode(item_name) ) {
            queries.push(`UPDATE category_items SET item_name = ? WHERE item_id=?`);
            values.push([encode(item_name), item_id]);
        } ;
        
        if (decode(oldItem.description) != decode(description) ) {
            queries.push(`UPDATE category_items SET description = ? WHERE item_id=?`);
            values.push([encode(description), item_id]);
        } ;
        
        if (oldItem.quantityAvailable != quantityAvailable ) {
            queries.push(`UPDATE category_items SET quantityAvailable = ? WHERE item_id=?`);
            values.push([quantityAvailable, item_id]);
        } ;

        
        if (oldItem.unitPrice != unitPrice ) {
            queries.push(`UPDATE category_items SET unitPrice = ? WHERE item_id=?`);
            values.push([unitPrice, item_id]);
        } ;

        //if a new image was uploaded
        if (oldItem.imageurl != imageurl || fileWasUploaded == true) {
            
            queries.push(`UPDATE category_items SET imageurl = ? WHERE item_id=?`);
            values.push([imageurl, item_id]);
        };
        
        for (var k = 0; k < queries.length; k++) {
            var query = queries[k];
            var data = values[k];
            console.log(`Executing query: ${query} with params: ${data}`);
            con.execute(query, data, function (error, results, fields) {
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
        var items_array = await app_cache.get(ITEMS_ARRAY); 
        items_array = await JSON.parse(JSON.stringify(items_array));
       
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
            items_array.splice(indexToDelete,1,itemObjectJson);
        } ;

        //items_array.push(itemObjectJson);
        if (!(item_id in itemsByID)) {
            itemsByID[item_id] = {} ;  
        } ;
        itemsByID[item_id][ITEMS_DETAILS] = await JSON.parse(JSON.stringify(itemObjectJson)) ;

        
        if (!(category_id in itemsByCategoryID)) {
            itemsByCategoryID[category_id] = [] ;  
        } ;

        var itemsByCategoryIDIndexToDelete = -1;
        for (var i=0 ; i <  itemsByCategoryID[category_id].length; i++) {
            var arrayItem = await JSON.parse(JSON.stringify(itemsByCategoryID[category_id][i]));
            if (arrayItem.item_id == oldItem.item_id) {
                itemsByCategoryIDIndexToDelete  = i ;
                break ;
            }
        } ;

        itemsByCategoryID[category_id].splice(itemsByCategoryIDIndexToDelete, 1, itemObjectJson);
        //itemsByCategoryID[category_id].push(itemObjectJson);
        
        if (!(category_webid in itemsByCategoryWebID)) {
            itemsByCategoryWebID[category_webid] = {} ;  
        } ;
        itemsByCategoryWebID[category_webid] = await JSON.parse(JSON.stringify(itemObjectJson));
        

        await app_cache.set(ITEMS_ARRAY,JSON.parse(JSON.stringify(items_array))); 
        await app_cache.set(ITEMS_BY_ID,JSON.parse(JSON.stringify(itemsByID))) ;
        await app_cache.set(ITEMS_BY_CATEGORY_ID,JSON.parse(JSON.stringify(itemsByCategoryID)));
        await app_cache.set(ITEMS_BY_CATEGORY_WEB_ID,JSON.parse(JSON.stringify(itemsByCategoryWebID)));
        
        const success_message = `Item updated successfully<br/>\n
        <a href='/${ADMIN_ROUTE}'>Back to Admin Dashboard</a>
        ` ;
        //con.releaseConnection();
        response.status(200).send(success_message);
        
    } catch (error) {
        console.log(`Error in admin.js updating item: ${error.message}`);
        con.execute('ROLLBACK');//con.rollback();
        //con.releaseConnection();
        return response.status(400).send('Error processing update item form');
        
    }
    
} ; 

const displayUpdateItemPage = async (request, response) => { 
                
    var app_cache = request.locals.app_cache ;
    var itemsByCategoryWebID = await app_cache.get(ITEMS_BY_CATEGORY_WEB_ID); 
    itemsByCategoryWebID = await JSON.parse(JSON.stringify(itemsByCategoryWebID)) ;
   
    var category_webid = new String(request.params.category_webid);
    if (!(category_webid in itemsByCategoryWebID)) {
        console.log(`An update occured in ${__filename} with a category_webid that was not found in cache or session.`);
        return response.status(400).send(`An Error Occured`);
    };
    var itemToUpdate = await itemsByCategoryWebID[category_webid] ;
    itemToUpdate = await JSON.parse(JSON.stringify(itemToUpdate));
   
    
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
    
    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
    

    response.render('layout', { 
        pageTitle: `Updating ${decode(itemToUpdate.item_name).slice(0,20)}`, 
        template: 'updateitemform', 
        categories: categories,
        user: user,
        userCart: userCart,
        item:itemToUpdate,
        IMG_DIR_FOR_WEB: IMG_DIR_FOR_WEB,
        csrfToken: request.csrfToken(),
        decode: decode,
        encode: encode,
    });
} ;

const getItemApiPost = async (request, response) => { 
    
    var category_id = new String(request.body.category_id);
    let itemsByCategoryID = await getCategoriesItems(tableName=CATEGORY_ITEMS_TABLE, category_id=category_id);
    itemsByCategoryID = await JSON.parse(JSON.stringify(itemsByCategoryID)) ;
    
    if (itemsByCategoryID && itemsByCategoryID.length > 0) {
        
        return response.status(200).json(itemsByCategoryID);
    } else {
        return response.status(401).json({'message':'Go away!!!'});
    }  

} ;
module.exports = {
    displayAdminDashboardPage,
    addItemPost,
    updateItemPost,
    getItemApiPost,
    displayUpdateItemPage
}