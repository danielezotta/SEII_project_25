/**
 * This function gets details of a product
 */
function loadPage() {

    // Get the container and empty it
    const container = document.getElementById('product');
    container.innerHTML = '';

    const myReview = document.getElementById('myReview');
    myReview.innerHTML = '';

    const reviews = document.getElementById('reviews');
    reviews.innerHTML = '';

    // Get the id of the product to display the details of
    var url_string = window.location.href;
    var url = new URL(url_string);
    var productId = url.searchParams.get("id");
    var userId = localStorage.getItem('user_id');

    fetch(`../api/v1/products/${productId}`)
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

    fetch(`../api/v1/reviews/${productId}`)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(reviews) { // Here you get the data
        //cerca review di utente corrente
        //se c'è mettila in cima in myReview
        //altrimenti metti la form per crearla
        var myReviewData = 0;
        reviews.forEach(review => {
            if ( review.userId == userId ){
                myReviewData = review;
                break;
            }
        });
        // Se è vero metti il form per creare una review nuova, altrimenti stampa la tua
        if ( myReviewData == 0 ){
            var form = document.createElement('form');
            var titleFormGroup = document.createElement('div');
            titleFormGroup.classList = "form-group";
            var titleLabel = document.createElement('label');
            titleLabel.innerHTML = "Titolo *";
            titleLabel.htmlFor = "title";
            var titleInput = document.createElement('input');
            titleInput.classList = "form-control";
            titleInput.type = "text";
            titleInput.id = "title";
            var textFormGroup = document.createElement('div');
            textFormGroup.classList = "form-group";
            var textLabel = document.createElement('label');
            textLabel.innerHTML = "Testo *";
            textLabel.htmlFor = "text";
            var textInput = document.createElement('input');
            textInput.classList = "form-control";
            textInput.type = "text";
            textInput.id = "text";

        } else {

        }
        console.log(reviews);
        reviews.map(function(review) {
            //metti tutte le altre review
        })
    })
    .catch( error => console.error(error) );
}