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


const session_mysql_connection = mysql.createConnection(session_database_options);
const sessionStore = new MySQLStore(session_database_options, session_mysql_connection);
app.use(session({
    secret: faker.internet.password(30),
    resave: true,
    saveUninitialized: false,
    store: sessionStore
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

app.use(async(request, response, next) => { 

    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
