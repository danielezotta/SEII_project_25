var products = [];

function allProducts(){
  fetch('../api/v1/products',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }})
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) {
    data.map(function(product) {
          products[product._id] = product.name;
    });
  })
  .catch( error => console.error(error) );
}

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
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) { // Here you get the data

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

      rows.forEach(row => { // Add all rows to the container
          bodyTable.appendChild(row);
      });

      return;
  })
  .catch( error => console.error(error) );
}
