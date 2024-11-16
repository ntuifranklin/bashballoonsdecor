const fs = require('fs');
require('dotenv').config();


async function uploadImageToCloudFlare(imagePath,filename_for_cloudflare="filename_for_cloudflare") {
        
    const image = fs.readFileSync(imagePath);
    const blob = new Blob([image]);

    const formData = new FormData();
    formData.append("file", blob, filename_for_cloudflare);
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;
    const bearer =`Bearer ${process.env.CLOUDFLARE_BEARER_TOKEN}`;
    //console.log(`${JSON.stringify({url:url, bearer:bearer})}`);
    try {
        const response = await fetch(
            url, {
            method: "POST",
            headers: {
                "Authorization": bearer,
            },
            body: formData,
        });
        // Your image has been uploaded
        // Do something with the response, e.g. save image ID in a database
        
        return await response.json();
    } catch (error) {
        throw new Error(error);
    }
} ;



exports.uploadImageToCloudFlare = uploadImageToCloudFlare ;


async function deleteExistingImageFromCloudFlare(cloudflare_imageID) {
        
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${cloudflare_imageID}`;
    const bearer =`Bearer ${process.env.CLOUDFLARE_BEARER_TOKEN}`;
    //console.log(`${JSON.stringify({url:url, bearer:bearer})}`);
    try {
        const response = await fetch(
            url, {
            method: "DELETE",
            headers: {
                "Authorization": bearer,
            }
        });
        // Your image has been uploaded
        // Do something with the response, e.g. save image ID in a database
        
        return await response.json();
    } catch (error) {
        throw new Error(error);
    }
} ;



exports.deleteExistingImageFromCloudFlare = deleteExistingImageFromCloudFlare ;
