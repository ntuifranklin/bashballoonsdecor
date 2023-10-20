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
    keys: [faker.internet.password(50),faker.internet.password(50)],
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
app.locals.googleMapsLink ='https://www.google.com/maps/place/7823+Parston+Dr+k,+Forestville,+MD+20747/@38.8469751,-76.8808755,15.84z/data=!4m10!1m2!2m1!1s+%09%09%09++7823+Parston+Dr+K,+Suite+E+%26+F,+Forestville+MD,+20747+!3m6!1s0x89b7be6074b9eddb:0x446d2f9aaed5368c!8m2!3d38.8461893!4d-76.8706054!15sCjU3ODIzIFBhcnN0b24gRHIgSywgU3VpdGUgRSAmIEYsIEZvcmVzdHZpbGxlIE1ELCAyMDc0N5IBCnN1YnByZW1pc2XgAQA!16s%2Fg%2F11qzd9h31x?entry=ttu';
app.locals.googleMapsFrameLink = 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15225.721829004784!2d-76.88704506829485!3d38.847475149901975!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7be6074b9eddb%3A0x446d2f9aaed5368c!2s7823%20Parston%20Dr%20k%2C%20Forestville%2C%20MD%2020747!5e0!3m2!1sen!2sus!4v1696811709651!5m2!1sen!2sus';

//app.locals.companyAddress = 'Hollow Log Dr, Upper Marlboro, MD 20774';
//setting global variables to be used by the whole app: 
app.use((request, response, next) => { 
    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});