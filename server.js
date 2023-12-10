const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const createError = require('http-errors');
const bodyParser = require('body-parser');


const cookieSession = require('cookie-session');

const template_folder = 'static_template';
const routes = require('./routes');
const { response } = require('express');

const app = express();

var mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const {session_database_options} = require('./sessionmanagement/session') ;
const PORT = process.env.SITE_PORT;
app.set('trust proxy', 1);

const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const databaseAccessor = require('./database/controllers/database.js');

const session_mysql_connection = mysql.createConnection(session_database_options);
const sessionStore = new MySQLStore(session_database_options, session_mysql_connection);
app.use(session({
    secret: faker.internet.password(30),
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {maxAge : 60000000},
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, `./${template_folder}`)));

app.locals.siteName = process.env.SITENAME;
app.locals.miniSiteName = process.env.MINI_SITENAME;
app.locals.pageTitle = process.env.PAGETITLE;
app.locals.companyAddress= process.env.COMPANY_ADDRESS;
app.locals.customerServiceNumber = process.env.CUSTOMER_SERVICE_NUMBER;
app.locals.customerServiceNumberExtra = process.env.CUSTOMER_SERVICE_NUMBER_EXTRA;
app.locals.customerServiceEmail = process.env.CUSTOMER_SERVICE_EMAIL;
app.locals.mediumLink = process.env.MEDIUM_LINK;
app.locals.facebookLink = process.env.FACEBOOK_LINK;
app.locals.instagramLink = process.env.INSTAGRAM_LINK;
app.locals.twitterLink = process.env.TWITTER_LINK;
app.locals.youtubeLink = process.env.YOUTUBE_LINK;
app.locals.googleMapsLink = process.env.GOOGLE_MAPS_LINK ;
app.locals.googleMapsFrameLink = process.env.GOOGLE_MAPS_FRAME_LINK ;

/* initialize it to null 
* then check later if it is null before you set it up
*/
app.locals.packages = null ; // packages as a JSON object
app.locals.packagesAndItems = null ; // packages and package items as a JSON object

//below enables accessing the packages through an indexd array
app.locals.packagesArray = null ;
app.locals.list_of_items = null ;
app.locals.products = null ;


var package3000ID = 'd09745340cebd03c6e0a';
var package3800ID = 'ab7adb97a1f89a92527a';
var package4900ID = 'bfcd68043040f450b8e7';

app.use(async(request, response, next) => { 

    /*
        Load user cart here so that it is accessible from all over the app
    */
    var userCart = {} ;
    if (request.session.userCart)
        userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
    app.locals.userCart = userCart;
            
    /* Database data for packages */
    if (app.locals.packages == null) {
        app.locals.packages = { } ;
    } ;

    

    const package_3000 = await databaseAccessor.getDatabaseObject(tableName='package',keyFieldName='packageid', keyFieldValue=package3000ID);
    const package_3800 = await databaseAccessor.getDatabaseObject(tableName='package',keyFieldName='packageid', keyFieldValue=package3800ID);
    const package_4900 = await databaseAccessor.getDatabaseObject(tableName='package',keyFieldName='packageid', keyFieldValue=package4900ID);
        
    app.locals.packages[package3000ID] = JSON.parse(JSON.stringify(package_3000));
    app.locals.packages[package3800ID] = JSON.parse(JSON.stringify(package_3800));
    app.locals.packages[package4900ID] = JSON.parse(JSON.stringify(package_4900)); 

    if ( app.locals.packagesAndItems == null) {
             
        /**
         * Load all packages here so it is available from all over the app
         * To do : replace the harded coded IDs below by a call to the database or reading from 
         * an environment variable
         */
        
        const package_and_items_3000 = await databaseAccessor.getPackageItems(packageid = package3000ID);
        const package_and_items_3800 = await databaseAccessor.getPackageItems(packageid = package3800ID);
        const package_and_items_4900 = await databaseAccessor.getPackageItems(packageid = package4900ID);
        
        app.locals.packagesAndItems = {} ;
        app.locals.packagesAndItems[package3000ID] = JSON.parse(JSON.stringify(package_and_items_3000)) ;
        app.locals.packagesAndItems[package3800ID] = JSON.parse(JSON.stringify(package_and_items_3800)) ;
        app.locals.packagesAndItems[package4900ID] = JSON.parse(JSON.stringify(package_and_items_4900)) ;
        
        //console.log(`Packages and Items : ${JSON.stringify(app.locals.packagesAndItems,null, 4)}`);
        app.locals.packagesArray = [
            package_and_items_3000,
            package_and_items_3800,
            package_and_items_4900,
        ];
        
    }

    var list_of_items = null ;
    if (app.locals.list_of_items == null) {
            
        /* get individual items */
        list_of_items = await databaseAccessor.getIndividualItems();
        app.locals.list_of_items = list_of_items ;
        console.log(`List of items  : ${JSON.stringify(list_of_items,null, 4)}`);

    };
    list_of_items = app.locals.list_of_items ;
    if (app.locals.products == null) { 
        app.locals.products = {} ;
    } ;
    
    /* now loop through the list_of_items */
    var index = 0 ;
    for (index = 0 ; index < list_of_items.length ; index++ ) {
        
        var item = list_of_items[index]; 
        var itemID = item.individItemID ;
        if (!(itemID in app.locals.products)) {
            app.locals.products[itemID] = {
            } ;
        } ;

        if (!("productDetails" in app.locals.products[itemID])) {
            app.locals.products[itemID]["productDetails"] = {} ;
        } ;
        app.locals.products[itemID]["productDetails"] = JSON.parse(JSON.stringify(item));
    } ;

    /* update  the request.locals */
    request.locals = app.locals ;

    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
