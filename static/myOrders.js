
//Array of pair {product_id:nameProduct} of all products in the database
//It serves to get the name of the product given the id
var products = [];

//It populates the array products

function allProducts(){
  fetch('../api/v1/products',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }})
  .then((resp) => resp.json())
  .then(function(data) {
    data.map(function(product) {
          products[product._id] = product.name;
    });
  })
  .catch( error => console.error(error) );
}

//It loads all the orders of the logged user

function loadMyOrders(){

  var bodyTable = document.getElementById('ordersTable');

  var user_id = localStorage.getItem('user_id');
  var token = localStorage.getItem('token');

  allProducts();

  fetch('../api/v1/products/myOrders/'+user_id,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': user_id,
                'x-access-token': token
            }})
  .then((resp) => resp.json())
  .then(function(data) {

    var number_of_orders = data.length;

    var rows = [];
    for (let i = 0; i < number_of_orders; i++) {
        rows[i] = document.createElement('tr');
    }

    var numRows = [];
    var nameProducts = [];
    var address = [];
    var amount = [];
    var timeStamp = [];
    var numCard = [];

    // Map through the results and for each run the code below
    data.map(function(product, i){
        numRows[i] = document.createElement('th');
        numRows[i].scope = "row";
        numRows[i].innerHTML= i+1;
        nameProducts[i] = document.createElement('td');
        nameProducts[i].innerHTML = products[product.product_id];
        address[i] = document.createElement('td');
        address[i].innerHTML = product.address;
        amount[i] = document.createElement('td');
        amount[i].innerHTML = product.amount;
        timeStamp[i] = document.createElement('td');
        product.timeStamp = product.timeStamp.replace("T", " - ");
        product.timeStamp = product.timeStamp.replace("Z", "");
        product.timeStamp = product.timeStamp.slice(0, -4);
        timeStamp[i].innerHTML = product.timeStamp;
        numCard[i] = document.createElement('td');
        numCard[i].innerHTML = product.numCard;

        rows[i].appendChild(numRows[i]);
        rows[i].appendChild(nameProducts[i]);
        rows[i].appendChild(address[i]);
        rows[i].appendChild(amount[i]);
        rows[i].appendChild(timeStamp[i]);
        rows[i].appendChild(numCard[i]);

    });

    // Add all rows to the container
    rows.forEach(row => {
        bodyTable.appendChild(row);
    });

    return;
  })
  .catch( error => console.error(error) );
}
