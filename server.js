const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');
const createError = require('http-errors');

const bodyParser = require('body-parser');

const template_folder = 'static_template';
const routes = require('./routes');


const {getDatabaseObject,getIndividualItems,getPackageItems} = require('./database/controllers/database');
const app = express();

var mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();

const {session_database_options} = require('./sessionmanagement/session') ;
const PORT = process.env.SITE_PORT;
app.set('trust proxy', 1);

const cookieParser = require('cookie-parser');


var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const session_mysql_connection = mysql.createConnection(session_database_options);
const sessionStore = new MySQLStore(session_database_options, session_mysql_connection);
app.use(session({
    secret: faker.internet.password(30),
    resave: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {maxAge : Number(process.env.SESSION_MAXIMUM_TIME_IN_MILLI_SECONDS)},
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


app.use(parseForm, csrfProtection, (request, response, next) => { 

    /*
        Load user cart here so that it is accessible from all over the app
    */
    var userCart = {} ;
    //userCart["totalPrice"] = 0.0 ;
    if (request.session.userCart)
        userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
    app.locals.userCart = userCart;
    //console.log(`User Cart In server.js: ${JSON.stringify(userCart, null, 4)}`);
    /* update  the request.locals */
    request.locals = app.locals ;

    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
   
});
