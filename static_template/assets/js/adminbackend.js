// This file is used to handle the admin backend page

$(document).ready(function() {
   


    // will process order and send email to both customer and email.
    // need email sender and stuff like that.
    
    $("#addItemCategory").click(async function (event) {
        /* Start by clearing the previous error message if any */
        $(`#addItemResult`).html('');

        
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
        console.log(`data : ${JSON.stringify(data)}`);
        console.log(`csrf : ${data._csrf}`);
        var formData = new FormData();
        //itemimgurl is the file id of the inout file.
        var files = $('#itemimgurl')[0].files[0]; 
        formData.append('itemimgurl',files);
        formData.append('_csrf', data._csrf);
        formData.append('itemName', data.itemName);
        formData.append('description', data.description);
        formData.append('quantityAvailable', data.quantityAvailable);
        formData.append('unitPrice', data.unitPrice);
        formData.append('category_id', data.category_id);
        await $.ajax({
            type: "POST",
            url: `/admin`,//form upload causes csrf error
            data: formData,
            contentType : false,
					  processData : false,
            //encode: true,
          }).done(function (data) {
            console.log(`${JSON.stringify(data)}`);
            var d = JSON.parse(JSON.stringify(data));
            var successHtml = ` 
            <div class="alert alert-success fade show" role="alert">
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
        reloadCategoryTable();
        event.preventDefault();
    });
    

    /* This function below will take from the database the list of category items selected */
    $('#category_id').on('change', function (e) {
      reloadCategoryTable();

    });

});


/* this function takes the category selected and loads the items 
  of that category into a particular table
*/
function reloadCategoryTable() {
   //http://bashballoonsrentals.com:9999/dashboard/uKmwctxAcAbRby8O
   var optionSelected = $("#category_id").find("option:selected");
   var valueSelected  = optionSelected.val();
   var textSelected   = optionSelected.text();
   
    
    $.ajaxSetup({
      headers: {
         'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
    
   const data = {
    '_csrf': $('input[name="_csrf"]').val(),
    'category_id': valueSelected,
    } ;
    $.ajax({
        type: "POST",
        url: `/admin/category_items`,
        data: data,
        encode: true,
      }).done(function (data) {
        
        var d = JSON.parse(JSON.stringify(data));
        console.log(`${d.length} items found for category ${textSelected }`);
        var htmlRows = '';
        
        for (var i = 0; i < d.length; i++) {
            htmlRows += `\n\t\t<tr>
            <td>${d[i].item_name}</td>
            <td>${d[i].description}</td>
            <td>$${d[i].unitPrice}</td>
            <td>${d[i].quantityAvailable}</td>
            </tr>\n`; 
        };
        $("#selectedCategoryTitle").html(`${textSelected} ${d.length} items`);
        
        $("#itemTableBody").html(htmlRows);
      }).fail(function (data) { 
        var d = JSON.parse(JSON.stringify(data));
        console.log(`error data gotten back : ${JSON.stringify(d)}`);        
      }); 
}