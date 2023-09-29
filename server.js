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

app.locals.siteName = 'Bash Balloons Decor';
//setting global variables to be used by the whole app: 
app.use((request, response, next) => { 
    response.locals.siteName = 'Bash Balloons Decor';
    response.locals.pageTitle= 'All Your Party Rentals and Decoration Needs';
    return next();
});

app.use('/',routes());


app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});