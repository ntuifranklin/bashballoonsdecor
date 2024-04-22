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

const {session_database_options} = require('./sessionmanagement/session') ;
const cookieParser = require('cookie-parser');
const {getCategories,getCategoriesItems} = require('./database/controllers/database');



/* File upload  */
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, //maximum 50 MB
}));

/* dynamically detect the folder we are running from,
 then select port accordingly */
const current_dir = __dirname
const PRODUCTION_ENV = process.env.BBD_LOCATION;
const TEST_ENV = process.env.TEST_BBD_LOCATION;
var PORT = process.env.TEST_SITE_PORT;
if ( current_dir == PRODUCTION_ENV) {
    PORT = process.env.PRODUCTION_SITE_PORT;
} else if (current_dir == TEST_ENV) {
    PORT = process.env.TEST_SITE_PORT;
}

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
if (PORT == process.env.PORUDCTION_SITE_PORT) {
        
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
app.locals.seoSiteLink = process.env.SEO_SITE_LINK;
app.locals.port = PORT ;




/* now loop through the list_of_items */
var index = 0 ;

const customers_feedback = require(process.env.CUSTOMERS_FEEDBACK_FILE);
app.locals.customers_feedback = customers_feedback ;

/* location where images are being sotred */
const {IMG_DIR_FOR_WEB} = require('./utilities/fileupload');

app.use(parseForm, csrfProtection, async(request, response, next) => { 

    /*
        Load user cart here so that it is accessible from all over the app
    */
    var userCart = {} ;
        
    var items_array = null ;
    var itemsByID = null ;
    var itemsByCategoryID = {}
    var categories = null ;
    var itemsByCategoryWebID = {};

    if (request.session.userCart)
        userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
    
    var item = null ;
   
    if (!items_array) {
        itemsByID = {} ;
        itemsByCategoryID = {} ;
        itemsByCategoryWebID = {};
        
        items_array = await getCategoriesItems ();
        
        for (var j=0 ; j < items_array.length; j++ ) {
            item = JSON.parse(JSON.stringify(items_array[j]));
            items_array[j].item_name = decode(item.item_name);
            var categoryID = item.category_id ;
            if (!(categoryID in itemsByCategoryID)) {
                itemsByCategoryID[categoryID] = [] ;
            } ;
            itemsByCategoryID[categoryID].push(item);
            var itemID = new String(item.item_id) ;
            
            if (!(itemID in itemsByID)) { 
                itemsByID[itemID] = {} ;
            } ;

            var category_webid = new String(item.category_webid);
            
            var category_id = new String(item.category_id);
            //console.log(`category_webid : ${category_webid}`);

            if (!(category_webid in itemsByCategoryWebID)) {
                itemsByCategoryWebID[category_webid] = {};
            } ;

           
            itemsByCategoryWebID[category_webid] = JSON.parse(JSON.stringify(item)) ;

            itemsByID[itemID]["itemDetails"] = JSON.parse(JSON.stringify(item)) ;
        } ;

      

        request.session.items_array = JSON.parse(JSON.stringify(items_array));
        request.session.itemsByID = JSON.parse(JSON.stringify(itemsByID)) ;
        request.session.itemsByCategoryID = JSON.parse(JSON.stringify(itemsByCategoryID));
        request.session.itemsByCategoryWebID = JSON.parse(JSON.stringify(itemsByCategoryWebID));
        //console.log(`Items By Category WebID : ${JSON.stringify(request.session.itemsByCategoryWebID)}`);
        //console.log(`Items By Category ID : ${JSON.stringify(request.session.itemsByCategoryID)}`);
        request.session.save();
    } ;

    //console.log(`itemsByID in server.js: ${JSON.stringify(request.session.itemsByID,null,4)}`);
    
    if (!categories ) {
        categories = await getCategories (tableName='categories') ;
        for (var i = 0; i <  categories.length; i++) {
            var category = JSON.parse(JSON.stringify( categories[i]));
            category.category_name = decode(category.category_name);
            //categories[i].category_name = category.category_name;
        };
        
        request.session.categories = await JSON.parse(JSON.stringify(categories));
        request.session.save();
    } ;

    request.session.userCart = await JSON.parse(JSON.stringify(userCart)) ;
    request.session.IMG_DIR_FOR_WEB = IMG_DIR_FOR_WEB ;
    request.session.save();
    response.locals.csrfToken = request.csrfToken();
    request.locals = app.locals ;
   
    return next();
});

app.use('/',routes());

//exporting app for testing
module.exports = app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
   
});

