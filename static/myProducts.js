function loadMyProducts(){
  // Get the container for the products
  const container = document.getElementById('products');
  container.innerHTML = '';

  var user_id = localStorage.getItem('user_id');
  var token = localStorage.getItem('token');

  fetch('../api/v1/products/myProducts/'+user_id,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'user-id': user_id,
                'x-access-token': token
            }})
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) { // Here you get the data

      // Get the number of products (used for the division of the products in rows)
      var number_of_products = data.length;

      // Create an array with all the rows
      var rows = [];
      for (let i = 0; i < number_of_products; i++) {
          rows[i] = document.createElement('div');
          rows[i].classList = "row";
      }

      // Create an array for each of the elements of the products cards
      var cols = [];
      var cards = [];
      var imgs = [];
      var names = [];
      var descriptions = [];
      var ids1 = [];
      var ids2 = [];
      var prices = [];
      var amounts = [];
      var cardBodies = [];
      var cardListGroups = [];
      var cardLinks = [];

      console.log(data);
      var i = 0;
      data.map(function(product) { // Map through the results and for each run the code below

          // Create all the elements for every product card

          if(product.amount>0){
            cols[i] = document.createElement('div');
            cols[i].classList = "col-sm mb-4";
            cards[i] = document.createElement('div');
            cards[i].classList = "card";
            imgs[i] = document.createElement('img');
            imgs[i].src = product.image;
            imgs[i].classList = "card-img-top";
            names[i] = document.createElement('h5');
            names[i].classList = "card-title";
            names[i].innerHTML = "<strong>" + product.name + "</strong>";
            descriptions[i] = document.createElement('p');
            descriptions[i].classList = "card-text";
            descriptions[i].innerHTML = product.description;
            cardBodies[i] = document.createElement('div');
            cardBodies.classList = "card-body";
            cardListGroups[i] = document.createElement('ul');
            cardListGroups[i].classList = "list-group list-group-flush";
            prices[i] = document.createElement('li');
            prices[i].classList = "list-group-item";
            prices[i].innerHTML = "<strong>" + product.price + "€</strong>";
            amounts[i] = document.createElement('li');
            amounts[i].classList = "list-group-item";
            amounts[i].innerHTML = product.amount + " disponibili";
            ids1[i] = document.createElement('button');
            ids1[i].addEventListener('click',function(e){window.location.href=`/sellProducts.html?id=${product._id}`},false);
            ids1[i].classList = "card-link btn btn-primary";
            ids1[i].innerHTML = "Modifica";
            ids2[i] = document.createElement('button');
            ids2[i].addEventListener('click', function(e){document.getElementById('productId').value=product._id;
                                                          $("#deleteProduct").modal("show")}, false);
            ids2[i].classList = "card-link btn btn-primary";
            ids2[i].innerHTML = "Elimina";
            cardLinks[i] = document.createElement('div');
            cardLinks[i].classList = "card-body";

            // Append all the element to eachother
            cardBodies[i].appendChild(names[i]);
            cardBodies[i].appendChild(descriptions[i]);
            cardListGroups[i].appendChild(amounts[i]);
            cardListGroups[i].appendChild(prices[i]);
            cardLinks[i].appendChild(ids1[i]);
            cardLinks[i].appendChild(ids2[i]);
            cards[i].appendChild(imgs[i]);
            cards[i].appendChild(cardBodies[i]);
            cards[i].appendChild(cardListGroups[i]);
            cards[i].appendChild(cardLinks[i]);
            cols[i].appendChild(cards[i]);
            rows[Math.floor(i/3)].appendChild(cols[i]);
            i ++;
          }


      })
      while (i%3 != 0){ // Pad the last row with empty columns to have 3 columns in each row
          let emptyCol = document.createElement('div');
          emptyCol.classList = "col-sm";
          rows[Math.floor(i/3)].appendChild(emptyCol);
          i++;
      }

      rows.forEach(row => { // Add all rows to the container
          container.appendChild(row);
      });

      return;
  })
  .catch( error => console.error(error) );
}
