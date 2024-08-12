
const { body, validationResult} = require('express-validator');
const {MIN_EMAIL_ADDR_LENGTH,
    MAX_EMAIL_ADDR_LENGTH
} = require('../utilities/email');

const contactFormValidation = [
    body('name').
        trim()
        .isLength({ min: 5, max:255 })
        .withMessage('Please enter your name.'),
    body('email').notEmpty()
        .withMessage('Email is required.')
        .isLength({min:MIN_EMAIL_ADDR_LENGTH, max:MAX_EMAIL_ADDR_LENGTH})
        .withMessage(`Email should be between ${MIN_EMAIL_ADDR_LENGTH} and  ${MAX_EMAIL_ADDR_LENGTH} characters long`)
        .isEmail()
        .withMessage('Email must be valid'),
    body('comment')
        .isLength({ min: 5, max:255 })
        .withMessage('Please a message.'),
    body('phone')
        .isLength({ min: 5, max:15 })
        .withMessage('Phone should be between 5 and '),
    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          return response.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.contactFormValidation = contactFormValidation ;

