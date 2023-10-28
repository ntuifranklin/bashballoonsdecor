const express = require('express');
const { faker } = require('@faker-js/faker');
const path = require('path');

const cookieSession = require('cookie-session');

const template_folder = 'static_template';

const routes = require('./routes');
const { response } = require('express');


const app = express();
const PORT = 8888;
app.set('trust proxy', 1);
app.use(cookieSession({
    name: 'session',
    keys: [faker.internet.password(16),faker.internet.password(16)],
}))


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, `./${template_folder}`)));


app.locals.siteName = 'Bash Balloons Decor and Rentals';
app.locals.pageTitle= 'All Your Party Rentals and Decoration Needs';
app.locals.companyAddress='7823 Parston Dr K, Suite E & F, Forestville MD, 20747';
app.locals.customerServiceNumber= '+1(240)-505-3664';
app.locals.customerServiceNumberExtra = '+1(240)755-1220';
app.locals.customerServiceEmail = 'asong_nic@yahoo.com';
app.locals.mediumLink = 'https://medium.com/@citation.bashballoonsdecor';
app.locals.facebookLink = 'https://www.facebook.com/BashBalloonDecorDeliveryInc';
app.locals.instagramLink = 'https://www.instagram.com/bashballoons_decor/';
app.locals.twitterLink = 'https://twitter.com/asong_nic';
app.locals.youtubeLink = 'https://www.youtube.com/@bashballoonsdecor2333';
app.locals.googleMapsLink ='https://maps.app.goo.gl/6GXT9YBSDnazZXwZ7';

//app.locals.companyAddress = 'Hollow Log Dr, Upper Marlboro, MD 20774';
//setting global variables to be used by the whole app: 
app.use((request, response, next) => { 
    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
