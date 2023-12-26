/* should contain functions regardign updating the cart */

function updateCart(productID, updateType){
    
    //console.log(` client side productID : ${productID}`);
    $.post({
        type: "POST",
        url: "/cart",
        dataType:"text/json",
        data: {'itemUpdateID': productID, 'updateType': updateType},
    });

}