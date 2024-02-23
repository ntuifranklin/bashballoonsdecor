/* should contain functions regardign updating the cart */
/* This function is called from any of the pages :
  - /packages 
  - /products-list
  - /
  When the user clicks on the add to cart button, this function is called.
  It updates the session variable and returns a success message.
  If the alertIndex variable is set, it contains the div id where the message should be displayed.
  This is useful on the index page that is super long and the user might not see the message if displayed at the top.
  Every other page should pass an empty string for the alertIndex variable or use the default function value.
*/
function updateCart(productID, source='', htmlID='#', alertIndex=''){
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    //console.log(` client side productID : ${productID}`);
    
    $.ajaxSetup({
      headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      }
    });
    $.ajax({
        type: "POST",
        url: "/cart",
        data: {
            'itemUpdateID': productID, 
            '_csrf': token,
            'source': source,
            'htmlID': htmlID
          },
    }).done((data) => {
      //console.log(`Success data received : ${JSON.stringify(data)}`);
      var successHtml = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>Success!</strong>  ${data.responseText}.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
      
      if(alertIndex != '')
        $(`#${alertIndex}`).html(successHtml);
      else
        $(`#cartResult`).html(successHtml);
    }).fail((data) => {
      
      //console.log(`Failure data received : ${JSON.stringify(data)}`);
      var errorHtml = ` 
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> ${data.responseText}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
      
      if(alertIndex != '')
        $(`#${alertIndex}`).html(errorHtml);
      else
        $(`#cartResult`).html(errorHtml);
    });
}

