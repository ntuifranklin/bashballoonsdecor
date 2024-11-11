const {decode, encode} = require('html-entities');
const {Email} = require('../utilities/email');
const {defaultMySQLDBConnectorConfig,MySQLDBConnector} = require('../database/models/MySQLDBConnector');
const {generateUniqueID} = require('../database/controllers/database');
const mysql2 = require('mysql2');
const {
    ITEMS_DETAILS,
    USER_CART,
    USER,
    CATEGORIES_TABLE
} = require('../utilities/web_page_variables');

const {
    writeDataToRedisCache, 
    deleteDataFromRedisCache,
    REDIS_DEFAULT_CACHING_OPTIONS
} =  require('../middleware/redis');
const {IMG_DIR_FOR_WEB} = require('../utilities/fileupload');

const checkoutFormPost = async (request, response) => {
 
   
    
    var userCart = request.locals.USER_CART ;
   
    userCart = await JSON.parse(JSON.stringify(userCart)) ;
    

    /* Get form data first, and sanitize or reject if necessary */
    const completename = new String(request.body.completename);
    const email = new String(request.body.email) ;
    const city = new String(request.body.city) ;
    const state = new String(request.body.state) ;
    const zipcode = new String(request.body.zipcode) ;
    const phone = new String(request.body.phone) ; 
    const street_address = new String(request.body.street_address) ;
    const order_note = new String(request.body.order_note);
    //Check email is valid


    let pool = null ;
    let con = null ;

    pool = mysql2.createPool(defaultMySQLDBConnectorConfig);
    con = pool;

    var transactionQueries = [];
    var transactionData = [];

    var totalItems = 0 ;

    var grandTotal = 0.0 ;
    try {
        pool = await MySQLDBConnector.getPool();
        con = pool;
        //generate new order id
        var order_id = await generateUniqueID(con=con, tableName="orders", keyFieldName="order_id", size=64) ;
        //generate new customer id
        var customer_id = await generateUniqueID(con=con, tableName="customers", keyFieldName="customer_id", size=16) ;
        const customerInsertSql = "INSERT INTO customers VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const customerInsertArray = [
            customer_id, 
            completename, 
            email, 
            street_address,
            city, 
            state, 
            zipcode, 
            phone, 
            order_note] ;
        transactionQueries.push(customerInsertSql);
        transactionData.push(customerInsertArray);
                          
        var orderInsertArray = [
            order_id,
            customer_id,
            new Date().toISOString().slice(0, 19).replace('T', ' '),
            0.0, //total_amount
            'pending',//payment_status
            '' //paypal_transaction_id
        ] ;
        var orderInsertSql = "INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?)";
        
        transactionData.push(orderInsertArray);
        transactionQueries.push(orderInsertSql);

        //List of items for stripe payment
        let productLineItems = [] ;
        //console.log(`order : oneOrderItemInsertSQL : ${oneOrderItemInsertSQL.length} : ${oneOrderItemInsertData.length}`);

        var emailOrderBodyHtml = "" ;
        var allIndividualItems = await JSON.parse(JSON.stringify(userCart)) ;
        //console.log(`${__filename}: All individual items in cart: ${JSON.stringify(allIndividualItems)}`);
        //emailOrderBodyHtml += "<table>";
        for(var itemKey in allIndividualItems)  {
            var  order_category_items_id = await generateUniqueID(con=con, tableName="order_category_items", keyFieldName="order_category_items_id", size=64) ;
        
            emailOrderBodyHtml += `\t\t\t<tr>\n`;

            var individualItem = await JSON.parse(JSON.stringify(allIndividualItems[itemKey])) ;
            var itemDetails = await JSON.parse(JSON.stringify(individualItem[ITEMS_DETAILS])) ;
            totalItems += individualItem.quantity ;
            var itemsSubTotal = individualItem.quantity * itemDetails.unitPrice ;
            grandTotal += itemsSubTotal ; 

            emailOrderBodyHtml += `\t\t\t\t<td>${itemDetails.item_name}</td>\n`;
            emailOrderBodyHtml += `\t\t\t\t<td>${individualItem.quantity}</td>\n`;
            emailOrderBodyHtml += `\t\t\t\t<td>${parseFloat(itemDetails.unitPrice).toFixed(2)}</td>\n`;
            emailOrderBodyHtml += `\t\t\t\t<td>$${itemsSubTotal.toFixed(2)}</td>\n`;
            emailOrderBodyHtml += `\t\t\t</tr>\n`;
        
            var oneOrderItemInsertSQL = "INSERT INTO `order_category_items` VALUES(?, ?, ?, ?, ?, ?)";
            var oneOrderItemInsertData = [
                order_category_items_id,
                order_id,
                itemDetails.category_id,
                individualItem.quantity,
                parseFloat(itemDetails.unitPrice).toFixed(2),
                parseFloat(itemsSubTotal).toFixed(2)
            ];
            productLineItems.push({
                price_data:{
                    currency: 'usd',
                    product_data:{
                        name:itemDetails.item_name
                    },
                    unit_amount: parseInt(parseFloat(itemDetails.unitPrice).toFixed(2)*100.0),
                },
                quantity:individualItem.quantity,
            });
            
            transactionQueries.push(oneOrderItemInsertSQL);
            transactionData.push(oneOrderItemInsertData);
        
        } ;
    
        orderInsertArray[3] = parseFloat(grandTotal).toFixed(2) ;
        con.execute('START TRANSACTION');
        
        for (var k = 0; k < transactionQueries.length; k++) {
            var query = transactionQueries[k];
            var data = transactionData[k];
            //console.log(`Executing query: ${query} with params: ${data}`);
            await con.execute(query, data, function (error, results, fields) {
                if (error) {
                    console.log(error);
                    //con.execute('ROLLBACK');
                    throw new Error(error);
                } 
            });
        }
    
        
        //console.log(`\n\n\nsuccessful payment url: ${successfullPaymentUrl} \n\n\n\n`);
        con.execute('COMMIT', function (error, results, fields) {
            if (error) {
                console.log(error);
                //con.execute('ROLLBACK');
                throw new Error(error);
            } 
        });
    
    } catch (error) {

        console.error("Error loading data, reverting changes: ", error);
        var rollBack = await con.execute('ROLLBACK');
        //console.log(`Error on ${__filename} :  ${error.message}`);
        response.status(400).send('Error processing your order');
        return ;
    };
    //update cart here
    
    const userCartNameVariable = request.locals.USER_CART_NAME ;
    const key = userCartNameVariable;
    
    await deleteDataFromRedisCache(key);
    request.locals.USER_CART = {} ;
    /* update the cart in the locals variable */
    
    var orderHtml = `<html>\n`;
    orderHtml += `<head>\n`;
    orderHtml += `<title>Order Confirmation</title>\n`;
    orderHtml += `<style>
                table, tr, th, td {
                border: 1px solid black;
                border-collapse: collapse;
                }
    </style>\n`;
    orderHtml += `</head>\n`;
    
    orderHtml += `<body>\n`;
    orderHtml += `\t<div class="container">\n`;
    orderHtml += `\t\t<h1>Order Confirmation</h1>\n`;      
    orderHtml += `\t\t<h3>Customer Phone : ${phone}</h3>\n`;
    orderHtml += `\t\t<h3>Customer Full Name : ${completename}</h3>\n`;
    orderHtml += `\t\t<h3>Customer Email : ${email}</h3>\n`;
    orderHtml += `\t\t<h3>Street Address : ${street_address}</h3>\n`;
    orderHtml += `\t\t<h3>City : ${city}</h3>\n`;
    orderHtml += `\t\t<h3>State : ${state}</h3>\n`;
    orderHtml += `\t\t<h3>Zip Code : ${zipcode}</h3>\n`;
    orderHtml += `\t\t<h3>Customer Order Note : ${order_note}</h3>\n`;
    orderHtml += `\t\t<h2>Order Details</h2>\n`;
    orderHtml += `\t\t<table class="table table-striped table-hover">\n`;
    
    orderHtml += `\t\t\t\t<tr>\n`;
    orderHtml += `\t\t\t\t\t<th>Ordered Item</th>\n`;
    orderHtml += `\t\t\t\t\t<th>Quantity</th>\n`;
    orderHtml += `\t\t\t\t\t<th>Unit Cost</th>\n`;
    orderHtml += `\t\t\t\t\t<th>Sub Total in USD</th>\n`;
    orderHtml += `\t\t\t\t</tr>\n`;

    orderHtml += `${emailOrderBodyHtml}`;
    orderHtml += `\t\t\t<tr>\n`;
    orderHtml += `\t\t\t\t<td>\n`;
    orderHtml += `\t\t\t\t<b>Grand Total : </b>\n`;
    orderHtml += `\t\t\t\t</td>\n`;
    orderHtml += `\t\t\t\t<td colspan=3>\n`;
    orderHtml += `\t\t\t\t<b>$${grandTotal.toFixed(3)}</b>\n`; 
    orderHtml += `\t\t\t\t</td>\n`;
    orderHtml += `\t\t\t</tr>\n`;

    //orderHtml += `\t\t\t\t</tbody>\n`;
    orderHtml += `\t\t\t</table>\n`;
    orderHtml += `\t\t</div>\n`;
    orderHtml += `\t</body>\n`;
    orderHtml += `</html>\n`;

    /* send the email */
    var emailSender = new Email();
    const orderConfirmationNumber = order_id ;
    var mailOptions = { 
        from: process.env.BCC_ORDER_EMAIL,
        subject: `Order Confirmation: ${orderConfirmationNumber}`,
        to: email,
        html: orderHtml
    };
    emailSender.sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html)
    .then(
        (result) => {
            
            //response.redirect(`${successfullPaymentUrl}`);
            //console.log(`Order Confirmation Email sent: ${JSON.stringify(result)}`);
            return response.status(200).send(`Order processed successfully<br/>\nYou will receive a confirmation email`);
             ;
        
        }
    )
    .catch((error) => {
        console.log(`\n\n\\n Error happened: ${error.message} \n\n\n`);
        response.redirect(`/${CHECKOUT_ROUTE}`);
        
    });

} ;

const showCheckoutPage = async(request, response) => { 
        
    
    var app_cache = request.locals.app_cache ;   
    var categories = await app_cache.get(CATEGORIES_TABLE);
    categories = await JSON.parse(JSON.stringify(categories));
         
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));
   
    //console.log('Passed cart : ' + JSON.stringify(userCart, null, 4));
    response.render('layout', 
        { 
            pageTitle: 'Wish list checkout', 
            template: 'checkout', 
            userCart: userCart,
            error: null,
            success:null,
            user:user,
            IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
            csrfToken: request.csrfToken(),
            categories: categories,
            decode: decode,
            encode: encode
        }
    );
} ;

module.exports = {
    checkoutFormPost,
    showCheckoutPage
} ;