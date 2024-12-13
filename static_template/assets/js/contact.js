$(document).ready(function(){
    $('#contact-form').submit((event) => {  //Don't foget to change the id form
        var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        //disable the submit button, then renable it later if an error occured
        $(this).attr('disabled', true);
        $.ajaxSetup({
          headers: {
              'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
          }
        });
        const data = {
          '_csrf': $('input[name="_csrf"]').val(),
          'name': $('input[name="name"]').val(),
          'email': $('input[name="email"]').val(),
          'comment': $('textarea[name="comment"]').val(),
          'phone': $('input[name="phone"]').val(),
          'token' : token,
        };
        $.ajax({
            type: "POST",
            url: "/contact",
            data: data,
        }).done((data) => {
          //console.log(`Success data received : ${JSON.stringify(data)}`);
          var successHtml = `
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <strong>Success!</strong>  ${data}.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
          //disable this button for other submissions
          $("#contactFormSubmitButtonID").prop("disabled",true); 
          $(`#contactFormAlertIndex`).html(successHtml);
          
          
        }).fail((data) => {
          //an error occured so renable contact button
          $(this).attr('disabled', false);
          //console.log(`Failure data received : ${JSON.stringify(data)}`);
          var errorHtml = ` 
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> ${data.responseText}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
          
          $(`#contactFormAlertIndex`).html(errorHtml);
          
        });
        event.preventDefault();
    });
});