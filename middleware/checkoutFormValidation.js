const { body, validationResult} = require('express-validator');
const {Email,isEmailValid,MIN_EMAIL_ADDR_LENGTH, MAX_EMAIL_ADDR_LENGTH,VALID_EMAIL_REGEXP} = require('../utilities/email');
const {MAX_BUFFER_SIZE} = require('../utilities/Fisl');
const {MIN_FULL_NAME_SIZE,MAX_FULL_NAME_SIZE} = require('../utilities/functions');
const checkoutValidator = [
    body('completename')
        .isLength({ min: MIN_FULL_NAME_SIZE, max:MAX_FULL_NAME_SIZE })
        .withMessage(`Full name must be between ${MIN_FULL_NAME_SIZE} and ${MAX_FULL_NAME_SIZE} characters.`),
    body('email')
        .isLength({min:MIN_EMAIL_ADDR_LENGTH, max:MAX_EMAIL_ADDR_LENGTH})
        .withMessage(`Email should be between ${MIN_EMAIL_ADDR_LENGTH}  and ${MAX_EMAIL_ADDR_LENGTH} characters.`)
        .isEmail()
        .withMessage('Email must be valid'),
    body('street_address')
        .isLength({ min: 5, max:MAX_BUFFER_SIZE }).withMessage('Please enter your street address.'),
    body('city').isLength({ min: 2, max:MAX_BUFFER_SIZE }).withMessage('Please enter your city.'),
    body('state').isLength({ min: 2, max:MAX_BUFFER_SIZE }).withMessage('Please enter your state.'),
    body('zipcode')
        .isLength({ min: 5, max:5 })
        .isZipCode()
        .withMessage('Please a valid zipcode.'),
    body('phone').isLength({ min: 5, max:10 }).withMessage('Please enter your phone number.'),
    body('order_note').isLength({ min: 5, max:MAX_BUFFER_SIZE }).withMessage('Please enter your order note.'),
    
    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          return response.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.checkoutValidator = checkoutValidator ;
