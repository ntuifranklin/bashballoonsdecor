/* should contain functions regardign updating the cart */

function updateCart(productID, updateType){
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    //console.log(` client side productID : ${productID}`);
    $.post({
        type: "POST",
        url: "/cart",
        dataType:"text/json",
        data: {
            'itemUpdateID': productID, 
            'updateType': updateType,
            '_csrf': token},
    });

}