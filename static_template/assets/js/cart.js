/* should contain functions regardign updating the cart */

function updateCart(productID){
    console.log(`calling updateCart with productID: ${productID}`);
    $.post({
        type: "POST",
        url: "/cart",
        body: JSON.stringify({'productID': productID}),
    }).then((res)=> console.log(res))
    .catch((e)=> console.log(e));

}