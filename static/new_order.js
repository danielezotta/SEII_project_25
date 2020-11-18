/**
 * This function is a confirm of an order
 * 
 */

function createOrder() {

    /*
     * insert control of input data,
     * insert control of token
     */

    var url_string = window.location.href;
    var url = new URL(url_string);
    //var product_id = url.searchParams.get("id");
    var product_id = "5fb54de34008a6127427f71b";
    //var user_id = localStorage.getItem('user_id');
    //var token = localStorage.getItem('token');
    var user_id = "5fb291268c27d33204eaf0d3";
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDU3MTc4NTMsImV4cCI6MTYwNTgwNDI1M30.Igi6LghmkGQdnyX8rdD-WqOU7x3uMcgi9wwJZDAVwcE";


    //compute address
    address = document.getElementById("inVia/localita'").value + " " +
              document.getElementById("inCivico").value + " " +  
              document.getElementById("inComune").value + " " +
              document.getElementById("inProvincia").value; 

    //request to server
    fetch(`../api/v1/order/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address }),
    })
    .then(function() {
        console.log("order done!");
    })
    .catch(error => console.error(error));
}