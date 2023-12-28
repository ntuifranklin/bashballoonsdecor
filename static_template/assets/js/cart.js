/* should contain functions regardign updating the cart */

function updateCart(productID, updateType, source='', htmlID='#'){
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
            'updateType': updateType,
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
      $('#cartResult').html(successHtml);
    }).fail((data) => {
      
      //console.log(`Failure data received : ${JSON.stringify(data)}`);
      var errorHtml = ` 
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> ${data.responseText}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
      $('#cartResult').html(errorHtml);
    });
}

