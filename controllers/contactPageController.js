const express = require('express');
const { decode,encode } = require('html-entities');

const {Email} = require('../utilities/email');

const {
    CATEGORIES_TABLE,
    IMG_DIR_FOR_WEB
} = require('../utilities/web_page_variables');


const {
   
    readDataFromRedisCache
} =  require('../middleware/redis');

const contactPage = async(request, response) => { 
    
    var categories = await readDataFromRedisCache(CATEGORIES_TABLE);
    categories = await JSON.parse(categories);
         
    var userCart = request.locals.USER_CART ;
    var user = request.locals.USER;
    userCart = await JSON.parse(JSON.stringify(userCart));
    user = JSON.parse(JSON.stringify(user));

    response.render('layout', { 
        pageTitle: 'Contact Us', 
        template: 'contact',
        csrfToken: request.csrfToken(),
        userCart: userCart,
        IMG_DIR_FOR_WEB :IMG_DIR_FOR_WEB,
        user:user,
        categories: categories,
        decode:decode,
        encode:encode,
    });
}
    
const contactFormPost = (request, response) => {    
    
    /* Process form */
    const name = new String(request.body.name);
    const email = new String(request.body.email);
    const comment = new String(request.body.comment);
    const phone = new String(request.body.phone);

    /* send the email */
    var emailSender = new Email();
    const emailObject = {
        to: process.env.BCC_ORDER_EMAIL,
        subject: `Contact form from ${name} with email: ${email}`,
        html: `
        Customer Details : <br/>\n
        Full Name : ${name} <br/>\n
        Email Address : ${email} <br/>\n
        Phone : ${phone} <br/>\n
        Message: ${comment}<br/>\n`,
    } ;
    emailSender.sendEmail(emailObject.to, emailObject.subject, emailObject.html).
    then((result) => {
        console.log(`Email sent: ${result}`);
        response.status(200).send(`Message sent successfully`);
    
    }).
    catch((err) => {
        console.log(`Error occured sending email: ${err}`);
        response.status(400).send(`An Error Occured while sending the email.`);
        
    });
    
} ;

module.exports = {
    contactPage,
    contactFormPost

};