// This file is used to handle the admin backend page

$(document).ready(function() {
    reloadCategoryTable();


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
   //console.log(valueSelected);
   //console.log(textSelected);
  
 
   $.get(`/admin/${valueSelected}`,
     (data) => {
       //console.log(`Request sent : ${JSON.stringify(data)}`);  
       var htmlRows = '';
       var d = JSON.parse(JSON.stringify(data));
       for (var i = 0; i < d.length; i++) {
           htmlRows += `\n\t\t<tr>
           <td>${d[i].item_name}</td>
           <td>${d[i].description}</td>
           <td>$${d[i].unitPrice}</td>
           <td>${d[i].quantityAvailable}</td>
           </tr>\n`; 
       };
       $("#selectedCategoryTitle").html(`${textSelected} ${d.length} items`);
       /*
       Request sent : [{"item_id":"4b379d2bc0354e64","item_name":"24K Black Tie Dining Chairs","description":"24K Black Tie Dining Chairs Because classics never go out of style! Have a seat at the table in style with our ultra-chic Dining Chairs.","category_id":"uKmwctxAcAbRby8O","category_webid":"1e5402d3","imageurl":"","quantityAvailable":21,"unitPrice":"16.09"}]
       
       */
       $("#itemTableBody").html(htmlRows);
   });
   
}