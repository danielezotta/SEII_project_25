/**
 * This function gets details of a product
 */
function loadPage() {

    // Get the container and empty it
    const container = document.getElementById('product');
    container.innerHTML = '';

    const myReview = document.getElementById('myReview');
    myReview.innerHTML = '';

    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = '';

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
                return;
            }
        });
        
        // Se è vero metti il form per creare una review nuova, altrimenti stampa la tua
        if ( myReviewData == 0 ){
            // Get the number of reviews
            var number_of_reviews = reviews.length;

            var title = document.createElement('h3');
            title.innerHTML = "Lascia una recensione!";
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
            titleInput.required = "true";
            var textFormGroup = document.createElement('div');
            textFormGroup.classList = "form-group";
            var textLabel = document.createElement('label');
            textLabel.innerHTML = "Testo *";
            textLabel.htmlFor = "text";
            var textInput = document.createElement('textarea');
            textInput.classList = "form-control";
            textInput.id = "text";
            textInput.style.height = "250px";
            textInput.required = "true";
            var ratingFormGroup = document.createElement('div');
            ratingFormGroup.classList = "form-group";
            var ratingLabel = document.createElement('label');
            ratingLabel.innerHTML = "Voto *";
            ratingLabel.htmlFor = "rating";
            var ratingInput = document.createElement('input');
            ratingInput.classList = "form-control";
            ratingInput.type = "text";
            ratingInput.id = "rating";
            ratingInput.required = "true";
            var submitButton = document.createElement('button');
            submitButton.innerHTML = "Invia";
            submitButton.type = "submit";
            submitButton.classList = "btn btn-primary";

            titleFormGroup.appendChild(titleLabel);
            titleFormGroup.appendChild(titleInput);
            textFormGroup.appendChild(textLabel);
            textFormGroup.appendChild(textInput);
            ratingFormGroup.appendChild(ratingLabel);
            ratingFormGroup.appendChild(ratingInput);

            form.appendChild(titleFormGroup);
            form.appendChild(textFormGroup);
            form.appendChild(ratingFormGroup);
            form.appendChild(submitButton);

            myReview.appendChild(title);
            myReview.appendChild(form);
        } else {
            // Get the number of reviews
            var number_of_reviews = reviews.length - 1;

            var title = document.createElement('h3');
            title.innerHTML = "La mia recensione";
            // Card per recensioni
            var row = document.createElement('div');
            row.classList = "row";
            var card = document.createElement('div');
            card.classList = "card col-12 mt-2 mb-2";
            card.style = "padding:0px";
            var cardTitleGroup = document.createElement('div');
            cardTitleGroup.classList = "card-header";
            cardTitle = document.createElement('h4');
            cardTitle.classList = "card-title";
            cardTitle.innerHTML = myReviewData.title;
            var cardListGroup = document.createElement('ul');
            cardListGroup.classList = "list-group list-group-flush";
            var cardScore = document.createElement('li');
            cardScore.classList = "list-group-item";
            cardScore.innerHTML = myReviewData.score;
            var cardText = document.createElement('li');
            cardText.classList = "list-group-item";
            cardText.style = "white-space: pre-wrap;";
            cardText.innerHTML = myReviewData.text;

            cardTitleGroup.appendChild(cardTitle);
            cardListGroup.appendChild(cardScore);
            cardListGroup.appendChild(cardText);
            card.appendChild(cardTitleGroup);
            card.appendChild(cardListGroup);
            row.appendChild(card);

            myReview.appendChild(title);
            myReview.appendChild(row);
        }
        
        // Create an array with all the rows
        var rows = [];
        for (let i = 0; i < number_of_reviews; i++) {
            rows[i] = document.createElement('div');
            rows[i].classList = "row";
        }

        var cards = [];
        var cardTitleGroups = [];
        var cardTitles = [];
        var cardListGroups = [];
        var cardScores = [];
        var cardTexts = [];

        reviews.map(function(review, i) {
            if ( review.userId == userId ){
                return;
            }

            // Card per recensioni
            cards[i] = document.createElement('div');
            cards[i].classList = "card col-12 mt-2 mb-2";
            cards[i].style = "padding:0px";
            cardTitleGroups[i] = document.createElement('div');
            cardTitleGroups[i].classList = "card-header";
            cardTitles[i] = document.createElement('h4');
            cardTitles[i].classList = "card-title";
            cardTitles[i].innerHTML = review.title;
            cardListGroups[i] = document.createElement('ul');
            cardListGroups[i].classList = "list-group list-group-flush";
            cardScores[i] = document.createElement('li');
            cardScores[i].classList = "list-group-item";
            cardScores[i].innerHTML = review.score;
            cardTexts[i] = document.createElement('li');
            cardTexts[i].classList = "list-group-item";
            cardTexts[i].style = "white-space: pre-wrap;";
            cardTexts[i].innerHTML = review.text;

            cardTitleGroups[i].appendChild(cardTitles[i]);
            cardListGroups[i].appendChild(cardScores[i]);
            cardListGroups[i].appendChild(cardTexts[i]);
            cards[i].appendChild(cardTitleGroups[i]);
            cards[i].appendChild(cardListGroups[i]);
            rows[i].appendChild(cards[i]);

            reviewsContainer.appendChild(rows[i]);
        })
    })
    .catch( error => console.error(error) );
}
