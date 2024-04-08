// This file is used to handle the admin backend page

$(document).ready(function() {
   


    // the below just adds an item to a category
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
    
    //The below will update an item within a category
    $("#updateItemCategory").click(async function (event) {
      /* Start by clearing the previous error message if any */
      $(`#updateItemResult`).html('');

      
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
          'item_id': $('input[name="item_id"]').val(),
          'category_webid': $('input[name="category_webid"]').val(),
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
      formData.append('item_id', data.item_id);     
      formData.append('category_webid', data.category_webid);      
      //var category_webid = data.category_webid;
      await $.ajax({
          type: "POST",
          url: `/admin/updateitem`,//form upload causes csrf error
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
          
          $(`#updateItemResult`).html(successHtml);
        }).fail(function (data) { 
          console.log(`${JSON.stringify(data)}`);
          var d = JSON.parse(JSON.stringify(data));
          var errorHtml = ` 
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> 
            <p>${d}</p>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`;
          
          $(`#updateItemResult`).html(errorHtml);
          
        });
      
      event.preventDefault();
      //location.href = location.href
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
        const editSvgVectorButton =`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
          </svg>
        `;
        for (var i = 0; i < d.length; i++) {
            htmlRows += `\n\t\t<tr>
            <td>${d[i].item_name}</td>
            <td>${d[i].description}</td>
            <td>$${d[i].unitPrice}</td>
            <td>${d[i].quantityAvailable}</td>
            <td><a href='/admin/updateitem/${d[i].category_webid}'>${editSvgVectorButton}</a></td>
            </tr>\n`; 
        };
        $("#selectedCategoryTitle").html(`${textSelected} ${d.length} items`);
        
        $("#itemTableBody").html(htmlRows);
      }).fail(function (data) { 
        var d = JSON.parse(JSON.stringify(data));
        console.log(`error data gotten back : ${JSON.stringify(d)}`);        
      }); 
}