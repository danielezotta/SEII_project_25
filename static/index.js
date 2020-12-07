/**
 * This function refresh the list of products
 */
function loadProducts() {

    // Get the container for the products
    const container = document.getElementById('products');
    container.innerHTML = '';

    fetch('../api/v1/products')
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(data) { // Here you get the data

        // Get the number of products (used for the division of the products in rows)
        var number_of_products = data.length;

        data.map(function(product) {
            if ( product.amount <= 0 ){
                number_of_products --;
            }
        });
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
        var ids = [];
        var prices = [];
        var amounts = [];
        var cardBodies = [];
        var cardListGroups = [];
        var cardLinks = [];

        var i = 0;
        data.map(function(product) { // Map through the results and for each run the code below
            if ( product.amount <= 0 ){
                return;
            }

            // Create all the elements for every product card
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
            ids[i] = document.createElement('a');
            ids[i].href = "product_details.html?id="+ product._id;
            ids[i].classList = "card-link";
            ids[i].innerHTML = "Dettagli";
            cardLinks[i] = document.createElement('div');
            cardLinks[i].classList = "card-body";
            
            // Append all the element to eachother
            cardBodies[i].appendChild(names[i]);
            cardBodies[i].appendChild(descriptions[i]);
            cardListGroups[i].appendChild(amounts[i]);
            cardListGroups[i].appendChild(prices[i]);
            cardLinks[i].appendChild(ids[i]);
            cards[i].appendChild(imgs[i]);
            cards[i].appendChild(cardBodies[i]);
            cards[i].appendChild(cardListGroups[i]);
            cards[i].appendChild(cardLinks[i]);
            cols[i].appendChild(cards[i]);
            rows[Math.floor(i/3)].appendChild(cols[i]);
            
            i ++;
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