const sharp = require('sharp');
const {IMG_DIR_FOR_WEB, template_folder} = require('../utilities/fileupload');
class Imageconverter {

    constructor(){

    }

    convert(image, new_name){
        

        return new Promise(async(resolve,reject) =>{
                
            console.log(image, "form image is here"); 
            console.log(image.data, "form image buffer data is here");

            sharp(image.data)     
            .toBuffer()            
            .then( newBuffer => { 

                
                let appRoot = '../';
                image.data = newBuffer ;
                //moving the new webq image to server public folders
                let new_image_name = new_name + Date.now() + '.webp' ;
                image.mv(__dirname + '/../' +  template_folder + IMG_DIR_FOR_WEB + new_image_name, 
                    function(err) {                
                        if (err) {                    
                            reject(err);                
                        }
                        resolve(new_image_name); 
                })            
            })            
            .catch( err => reject(err) );


        });
    }


}


exports.Imageconverter = Imageconverter ;