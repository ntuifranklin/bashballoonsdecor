$(document).ready(() => {
    
    $('#contactFormSubmitButton').click((e) => {
        
        e.preventDefault();
        grecaptcha.ready(function() {
            const google_recaptcha_site_key = "6Lf3uYcpAAAAADdf_Zp-Igl92elMYGfypSBlSw4T";
            console.log(`submitted with ${google_recaptcha_site_key}`);
            grecaptcha.execute(google_recaptcha_site_key, {action: 'submit'}).then(function(token) {
                // Add your logic to submit to your backend server here.
            });
        });

    });



    

});