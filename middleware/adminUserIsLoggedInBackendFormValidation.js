const {MAX_ITEM_NAME_SIZE, MAX_DESCRIPTION_SIZE, MAX_BUFFER_SIZE} = require('../utilities/Fisl');
const { body, validationResult} = require('express-validator');

const addItemFormValidator = [
    body('itemName')
        .notEmpty()
        .withMessage('Please enter the item name.')
        .escape()
        .isLength({ min: 3, max:MAX_ITEM_NAME_SIZE})
        .withMessage(`Name of the Item should be between 3 and ${MAX_ITEM_NAME_SIZE} characters`),
    body('description')
        .isLength({ min: 3, max:MAX_DESCRIPTION_SIZE })
        .escape()
        .notEmpty()
        .withMessage(`Item description should be between 3 and ${MAX_ITEM_NAME_SIZE} characters`),
    body('quantityAvailable')
        .isLength({ min: 1 })
        .escape().isNumeric()
        .withMessage('Please enter a quantity'),
    body('category_id')
        .isLength({ min: 1 })
        .escape()
        .isAlphanumeric()
        .withMessage('Please select a category'),
    body('unitPrice')
        .isLength({ min: 1 })
        .escape().isNumeric().
        withMessage('Please enter a price'),
    (request, response, next) => {
       
    //.log(`\nChecked the files array successful\nChecking the image type`);
    /* check the mimetype of the file */
    var acceptedImageTypes = /jpeg|jpg|png|gif/;
    var correct_mimetype = acceptedImageTypes.test(request.files.itemimgurl.mimetype);
    if (!correct_mimetype) {
        console.log(`Error wrong file type uploaded`);
        return response.status(400).send(`Only images of this type ${acceptedImageTypes} are accepted`);
        
        
    }
    
    const formerrors = validationResult(request);
    if (!formerrors.isEmpty()) {
        const err_message = formerrors.array().map(i => i.msg).join('<br>');
        return response.status(400).send(`${JSON.parse(JSON.stringify(err_message))}`); 
    };
    //console.log(`Before checking the files array length`);
    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).send('No item image was uploaded.');
        
    } ;
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    } ;
    next();
    }
];

/* The varibale below is just a replica for the above */
const itemUpdateFormValidator = [
    body('itemName').isLength({ min: 3, max:255}).escape().notEmpty().withMessage('Please enter the item name.'),
    body('description').isLength({ min: 3, max:1024 }).escape().notEmpty().withMessage('Please enter the item description.'),
    body('quantityAvailable').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a quantity'),
    body('unitPrice').isLength({ min: 1 }).escape().isNumeric().withMessage('Please enter a price'),
    (request, response, next) => {
    
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const postItemApiBodyValidator = [
    body('category_id')
        .notEmpty()
        .withMessage('Select a Category')
        .escape().isAlphanumeric().withMessage('Invalid Category Selected'),
    (request, response, next) => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
          return response.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    addItemFormValidator,
    itemUpdateFormValidator,
    postItemApiBodyValidator
} ;
