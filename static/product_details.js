/**
 * This function gets details of a product
 */
function loadProduct() {

    // Get the container and empty it
    const container = document.getElementById('product');
    container.innerHTML = '';

    // Get the id of the product to display the details of
    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");

    fetch(`../api/v1/products/${id}`)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(product) { // Here you get the data
        
        // Create a card for the product
        var card = document.createElement('div');
        card.classList = "card";
        var img = document.createElement('img');
        img.src = product.image;
        img.classList = "card-img-top";
        var name = document.createElement('h5');
        name.classList = "card-title";
        name.innerHTML = "<strong>" + product.name + "</strong>";
        var description = document.createElement('p');
        description.classList = "card-text";
        description.innerHTML = product.description;
        var cardBody = document.createElement('div');
        cardBody.classList = "card-body";
        var cardListGroup = document.createElement('ul');
        cardListGroup.classList = "list-group list-group-flush";
        var price = document.createElement('li');
        price.classList = "list-group-item";
        price.innerHTML = "<strong>" + product.price + "€</strong>";
        var amount = document.createElement('li');
        amount.classList = "list-group-item";
        amount.innerHTML = product.amount + " disponibili";
        var id = document.createElement('a');
        id.href = "new_order.html?id="+ product._id;
        id.classList = "card-link";
        id.innerHTML = "Acquista";
        var cardLink = document.createElement('div');
        cardLink.classList = "card-body";
        
        // Append all the element to eachother
        cardBody.appendChild(name);
        cardBody.appendChild(description);
        cardListGroup.appendChild(amount);
        cardListGroup.appendChild(price);
        cardLink.appendChild(id);
        card.appendChild(img);
        card.appendChild(cardBody);
        card.appendChild(cardListGroup);
        card.appendChild(cardLink);
        container.appendChild(card);
        
    })
    .catch( error => console.error(error) );
}