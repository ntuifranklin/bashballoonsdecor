$(document).ready(function() {

    // will process order and send email to both customer and email.
    // need email sender and stuff like that.
    $("#ordercheckout").submit(function (event) {

        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        const data = {
            '_csrf': $('input[name="_csrf"]').val(),
            'completename': $('input[name="completename"]').val(),
            'email': $('input[name="email"]').val(),
            'street_address': $('input[name="street_address"]').val(),
            'city': $('input[name="city"]').val(),
            'state': $('select[name="state"] option:selected').val(),
            'zipcode': $('input[name="zipcode"]').val(),
            'phone': $('input[name="phone"]').val(),
            'order_note': $('textarea[name="order_note"]').val(),
            '_csrf': $('input[name="_csrf"]').val(),
        } ;
        $.ajax({
            type: "POST",
            url: "/checkout",
            data: data,
            encode: true,
          }).done(function (data) {
            
            var successHtml = ` 
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              <strong>Success!</strong> 
              <p>${data.responseText}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            //Then disable the submit button for the form
            $("#orderCheckoutSubmitButton").attr('disabled', true) ;
            //disable the table that
            $("#checkoutTableListItems").remove();
            //Then show success message
            $(`#processOrderResult`).html(successHtml);
            

          }).fail(function (data) { 
            var errorHtml = ` 
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> 
              <p>${data.responseText}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#processOrderResult`).html(errorHtml);
            
          });

        event.preventDefault();
    });

});