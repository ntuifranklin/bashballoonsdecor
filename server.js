const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const createError = require('http-errors');

const bodyParser = require('body-parser');
const {decode} = require('html-entities');
const template_folder = 'static_template';
const routes = require('./routes');

const app = express();
app.use(express.json());

var mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
var mysql2 = require('mysql2');
const {session_database_options} = require('./sessionmanagement/session') ;

const cookieParser = require('cookie-parser');
const {getCategories,getCategoriesItems} = require('./database/controllers/database');

/* dynamically detect the folder we are running from,
 then select port accordingly */
const current_dir = __dirname
const PRODUCTION_ENV = process.env.BBD_LOCATION;
const TEST_ENV = process.env.TEST_BBD_LOCATION;
var PORT = 9999;
if ( current_dir == PRODUCTION_ENV) {
    PORT = process.env.SITE_PORT;
} else if (current_dir == TEST_ENV) {
    PORT = process.env.TEST_SITE_PORT;
}

//console.log(`are we in test ? ${current_dir == TEST_ENV}`);
//console.log(`are we in production ? ${current_dir == PRODUCTION_ENV}`);

var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({extended: true}));

const site_secret = faker.internet.password(30);
//console.log(`Generated site secret as : ${site_secret}`);
const session_mysql_connection = mysql.createConnection(session_database_options);
const sessionStore = new MySQLStore(session_database_options, session_mysql_connection);

var dynamicCookie =  {
    sameSite: 'none',
    maxAge: Number(process.env.SESSION_MAXIMUM_TIME_IN_MILLI_SECONDS),
    secure: false,
    httpOnly: false,
};
var sessionBasedOnEnvironment = {
    name: process.env.SESSION_NAME,
    secret: site_secret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: dynamicCookie,
} ;

/* If in a production environment, then use un secure cookies */
if (PORT == process.env.SITE_PORT) {
        
    app.set('trust proxy', 1) // trust first proxy
    dynamicCookie.secure = true; // serve secure cookies
    dynamicCookie.sameSite = 'strict';
    dynamicCookie.httpOnly = true;
    app.use(cookieParser(site_secret, dynamicCookie));
} else {
     
    app.set('trust proxy', 0) // trust first proxy
    dynamicCookie.secure = false; // we do not need to serve secure cookies
    dynamicCookie.sameSite = 'strict';
    dynamicCookie.httpOnly = false;
    app.use(cookieParser(site_secret, dynamicCookie));
} ;

app.use(session(sessionBasedOnEnvironment));

/* Prevent attackes from guessing passwords with rate limiting per IP address */
const { rateLimit } = require('express-rate-limit');

const form_rate_limiter = rateLimit({
	windowMs: 30 * 60 * 1000, // 30 minutes
	limit: 10000, // Limit each IP to 1000 requests per `window` (here, per 30 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Use an external store for consistency across multiple server instances.

})

// Apply the rate limiting middleware to all requests.
app.use(form_rate_limiter); 


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
//app.set('assets', path.join(__dirname, './assets'));
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
app.locals.individualItems = null ;


var package3000ID = process.env.PACKAGE3000ID;
var package3800ID = process.env.PACKAGE3800ID;
var package4900ID = process.env.PACKAGE4900ID;

const allpackages = require(process.env.PACKAGES_ONLY_FILE);


/* TODO: figure out how to place these json files as a return string from a sql query
    the issue is that I attempted to use a function that returns the query result as a json object, or 
    a string, and due to the syntax constraints of promises, I kept having syntax errors: promise must be in a function or
    top leel module. The solution was to run the query on the command line, and place the result in a json file, which I did
    However every new package or item added to the database will require a manual update of the json file.
*/
const [
    package_3000,
    package_3800,
    package_4900,
] = [
    allpackages["package_3000"],
    allpackages["package_3800"],
    allpackages["package_4900"],
];

const [
    package_and_items_3000,
    package_and_items_3800,
    package_and_items_4900
] = [
    require(process.env.PACKAGE_AND_ITEMS_3000_FILE),
    require(process.env.PACKAGE_AND_ITEMS_3800_FILE),
    require(process.env.PACKAGE_AND_ITEMS_4900_FILE),
];
/*
console.log(`package_and_items_3000 : ${JSON.stringify(package_and_items_3000,null, 4)}`) ;
console.log(`package_and_items_3800 : ${JSON.stringify(package_and_items_3800,null, 4)}`) ;
console.log(`package_and_items_4900 : ${JSON.stringify(package_and_items_4900,null, 4)}`) ;
*/
/* Database data for packages */
app.locals.packages = { } ;
app.locals.packages[package3000ID] = JSON.parse(JSON.stringify(package_3000));
app.locals.packages[package3800ID] = JSON.parse(JSON.stringify(package_3800));
app.locals.packages[package4900ID] = JSON.parse(JSON.stringify(package_4900)); 

/**
     * Load all packages here so it is available from all over the app
     * To do : replace the harded coded IDs below by a call to the database or reading from 
     * an environment variable
     */
    
app.locals.packagesAndItems = {
    [package3000ID] : {
    },
    [package3800ID] : {
    },
    [package4900ID] : {
    }
} ;
app.locals.packagesAndItems[package3000ID] = JSON.parse(JSON.stringify(package_and_items_3000)) ;
app.locals.packagesAndItems[package3800ID] = JSON.parse(JSON.stringify(package_and_items_3800)) ;
app.locals.packagesAndItems[package4900ID] = JSON.parse(JSON.stringify(package_and_items_4900)) ;

//console.log(`Packages and Items : ${JSON.stringify(app.locals.packagesAndItems,null, 4)}`);
app.locals.packagesArray = [
    package_and_items_3000,
    package_and_items_3800,
    package_and_items_4900,
];


/* get individual items */
    
//console.log(`${process.env.INDIVIDUAL_ITEMS_ONLY_FILE}`);
const list_of_items = require(process.env.INDIVIDUAL_ITEMS_ONLY_FILE);
//console.log(`list_of_items : ${JSON.stringify(list_of_items,null, 4)}`) ;

app.locals.list_of_items = list_of_items ;
//console.log(`List of items  : ${JSON.stringify(list_of_items,null, 4)}`);

app.locals.individualItems = {} ;

/* now loop through the list_of_items */
var index = 0 ;
for (index = 0 ; index < list_of_items.length ; index++ ) {
    
    var item = list_of_items[index]; 
    var itemID = String(item.individItemID) ;
    if (!(itemID in app.locals.individualItems)) {
        app.locals.individualItems[itemID] = {
        } ;
    } ;

    app.locals.individualItems[itemID]["individualItemDetails"] = JSON.parse(JSON.stringify(item));
} ;



const customers_feedback = require(process.env.CUSTOMERS_FEEDBACK_FILE);
app.locals.customers_feedback = customers_feedback ;

app.use(parseForm, csrfProtection, async(request, response, next) => { 

    /*
        Load user cart here so that it is accessible from all over the app
    */
    var userCart = {} ;
        
    var category_items = null ;
    var categories = null ;
    var categoriesItemsHash = {} ;

    if (request.session.userCart)
        userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
    app.locals.userCart = userCart;
    if (!request.session.category_items) {
        category_items = await getCategoriesItems ();
        category_items = JSON.parse(JSON.stringify(category_items));
        var category_item = null ;
        for (var j=0 ; j < category_items.length; j++ ) {
            category_item = JSON.parse(JSON.stringify(category_items[j]));
            category_items[j].item_name = decode(category_item.item_name);
            var categoryID = category_item.category_id ;
            if (!(categoryID in categoriesItemsHash)) {
                categoriesItemsHash[categoryID] = [] ;
            } ;
            categoriesItemsHash[categoryID].push(category_item);
        } ;
        
        request.session.categoriesItemsHash = categoriesItemsHash ;
        app.locals.categoriesItemsHash = categoriesItemsHash ;
        request.session.category_items = category_items ;
        app.locals.category_items = category_items ;
        
        request.session.save();

    } ;

    
    
    if (!request.session.categories) {
        categories = await getCategories (tableName='categories') ;
        for (var i = 0; i < categories.length; i++) {
            var category = JSON.parse(JSON.stringify(categories[i]));
            category.category_name = decode(category.category_name);
            
        };
        request.session.categories = categories ;
       
        app.locals.categories = categories ;
        
        request.session.save();
       
    } ;

    request.locals = app.locals ;
    request.session.save();

    //console.log(`Categories : ${JSON.stringify(request.session.categories,null, 4)}`);
    //console.log(`Category Items : ${JSON.stringify(request.session.category_items,null, 4)}`);
    //console.log(`Category Items Hash: ${JSON.stringify(request.session.categoriesItemsHash,null, 4)}`);

    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
   
});
