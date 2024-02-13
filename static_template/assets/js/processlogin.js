jQuery(document).ready(function(){

    /* 
        On loading of the login page, set the display for
        the otp login form input to be none.
    */
    $('#otpverifyform').css('display','none');

    $('#loginform').on('submit',function(event) {  //Don't foget to change the id form
       
        /* get the form data */
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        const data = {
            '_csrf': $('input[name="_csrf"]').val(),
            'email': $('input[name="email"]').val(),
            'password': $('input[name="password"]').val(),
        } ;
        $.ajax({
            type: "POST",
            url: "/login",
            data: data,
            encode: true,
        }).done(function (data) {
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var successHtml = ` 
            <div class="alert alert-success fade show" role="alert">
              <strong>Success!</strong>
              <p>${d}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#loginfeedback`).html(successHtml);
            /* If the user name and password are correct, then show the otp form */
            $('#otpverifyform').toggle();
            /* update user_email with current user email since login was successful */
            $('input[name="user_email"]').val($('input[name="email"]').val());

            /* Hide the login form to leave room for the one time password form */
            $('#loginform').toggle();
            
        }).fail(function (data) { 
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var errorHtml = ` 
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> 
              <p>${d.responseText}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#loginfeedback`).html(errorHtml);
        });
          
        event.preventDefault();
    });



    /* process otp form */
    $('#otpverifyform').on('submit',function(event) {  //Don't foget to change the id form
       
        /* get the form data */
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        const data = {
            '_csrf': $('input[name="_csrf2"]').val(),
            'user_email': $('input[name="user_email"]').val(),
            'otp': $('input[name="otp"]').val(),
            
        } ;
        $.ajax({
            type: "POST",
            url: "/verifyotp",
            data: data,
            encode: true,
        }).done(function (data) {
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var successHtml = ` 
            <div class="alert alert-success fade show" role="alert">
              <strong>Success!</strong>
              <p>${d}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#loginfeedback`).html(successHtml);
            /* If the useremail and one time password are correct, 
            then hide otp form */
            $('#otpverifyform').toggle();
        }).fail(function (data) { 
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var errorHtml = ` 
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> 
              <p>${d.responseText}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#loginfeedback`).html(errorHtml);
        });
          
        event.preventDefault();
    });
  
  });