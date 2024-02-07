$(document).ready(function() {

    // will process order and send email to both customer and email.
    // need email sender and stuff like that.
    
    
    $("#addItemCategory").click(function (event) {
        /* Start by clearing the previous error message if any */
        $(`#addItemResult`).html('');

        /* get the form data */
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        const data = {
            '_csrf': $('input[name="_csrf"]').val(),
            'itemName': $('input[name="itemName"]').val(),
            'description': $('textarea[name="description"]').val(),
            'quantityAvailable': $('input[name="quantityAvailable"]').val(),
            'unitPrice': $('input[name="unitPrice"]').val(),
            'category_id': $('select[name="category_id"]').val(),
        } ;
        $.ajax({
            type: "POST",
            url: "/admin",
            data: data,
            encode: true,
          }).done(function (data) {
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var successHtml = ` 
            <div class="alert alert-success alert-dismissible fade show" role="alert">
              <strong>Success!</strong>
              <p>${d}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#addItemResult`).html(successHtml);
          }).fail(function (data) { 
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var errorHtml = ` 
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> 
              <p>${d}</p>
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
            
            $(`#addItemResult`).html(errorHtml);
            
          });

        event.preventDefault();
    });
    

    /* This function below will take from the database the list of category items selected */
    $('#categoryDropdownSelect').on('change', function (e) {
        var optionSelected = $(this).find("option:selected");
        var valueSelected  = optionSelected.val();
        var textSelected   = optionSelected.text();
        console.log(valueSelected);
        console.log(textSelected);
    });

});