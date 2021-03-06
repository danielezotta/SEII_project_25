// This for and the setScore function are used to manage the star rating
// in the forms to create and edit reviews
var stars = [];

for (let i = 0; i < 5; i++) {
    stars[i] = document.createElement('img');
    stars[i].style.width = "30px";
    stars[i].style.height = "30px";
    stars[i].src = "img/empty-star.png";
    stars[i].addEventListener("click", function(){setScore(i+1)});
}

var scoreValue = 0;

function setScore(value) {
    for (let i = 0; i < value; i++) {
        stars[i].src = "img/full-star.png";
    }
    for (let i = value; i < 5; i++) {
        stars[i].src = "img/empty-star.png";
    }
    scoreValue = value;
}

// Function that creates the review form, both to create and edit reviews
function loadForm(myReview, review = false){
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
    var scoreFormGroup = document.createElement('div');
    scoreFormGroup.classList = "form-group";
    var scoreLabel = document.createElement('label');
    scoreLabel.innerHTML = "Voto *";
    scoreLabel.htmlFor = "score";
    var scoreInput = document.createElement('div');
    scoreInput.id = "score";
    var submitButton = document.createElement('button');
    submitButton.innerHTML = "Invia";
    if ( review ){
        submitButton.addEventListener('click', function(e){submitEditedReview(review._id)}, false);
    } else {
        submitButton.addEventListener('click', function(e){createReview()}, false);
    }
    submitButton.classList = "btn btn-primary";
    submitButton.type = "button";

    if ( review ){
        setScore(review.score);
        titleInput.value = review.title;
        textInput.value = review.text;
    }

    for (let i = 0; i < 5; i++) {
        scoreInput.appendChild(stars[i]);
    }
    titleFormGroup.appendChild(titleLabel);
    titleFormGroup.appendChild(titleInput);
    textFormGroup.appendChild(textLabel);
    textFormGroup.appendChild(textInput);
    scoreFormGroup.appendChild(scoreLabel);
    scoreFormGroup.appendChild(scoreInput);

    form.appendChild(titleFormGroup);
    form.appendChild(textFormGroup);
    form.appendChild(scoreFormGroup);
    form.appendChild(submitButton);

    myReview.appendChild(title);
    myReview.appendChild(form);
}

// This function gets details of a product

function loadPage() {

    // Get the containers and empty it
    const container = document.getElementById('product');
    container.innerHTML = '';

    const myReview = document.getElementById('myReview');
    myReview.innerHTML = '';

    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = '';

    const emptyStar = document.createElement('img');
    emptyStar.style.width = "30px";
    emptyStar.style.height = "30px";
    emptyStar.src = "img/empty-star.png";

    const fullStar = document.createElement('img');
    fullStar.style.width = "30px";
    fullStar.style.height = "30px";
    fullStar.src = "img/full-star.png";

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

        var buy; var cart;
        var id;
        if (product.amount <= 0){
            id = document.createElement('h4');
            id.innerHTML = "Prodotto non disponibile";
        } else {
            buy = document.createElement('button');
            buy.addEventListener('click', function(e){window.location.href='new_order.html?id='+product._id}, false);
            buy.style = "margin-right: 5px";
            buy.classList = "btn btn-primary";
            buy.innerHTML = "Acquista";

            cart = document.createElement('button');
            cart.addEventListener('click', function(e){viewProductsAvailable();$("#modalAggiungiAlCarrello").modal("show");}, false);
            cart.classList = "btn btn-primary";
            cart.innerHTML = "Aggiungi al carrello";
        }

        var cardLink = document.createElement('div');
        cardLink.classList = "card-body";

        var cardButton = document.createElement('div');
        cardButton.classList = "card-body";

        // Append all the element to eachother
        cardBody.appendChild(name);
        cardBody.appendChild(description);
        cardListGroup.appendChild(amount);
        cardListGroup.appendChild(price);
        cardButton.appendChild(buy);
        cardButton.appendChild(cart);
        card.appendChild(img);
        card.appendChild(cardBody);
        card.appendChild(cardListGroup);
        card.appendChild(cardButton);
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

        var number_of_reviews;

        // Se è vero metti il form per creare una review nuova, altrimenti stampa la tua
        if ( userId == null ){
            number_of_reviews = reviews.length;
            var hr = document.getElementById("myReviewHr");
            hr.parentNode.removeChild(hr);
            var container = document.getElementById("myReview");
            container.parentNode.removeChild(container);
        } else if ( myReviewData == 0 ){
            // Get the number of reviews
            number_of_reviews = reviews.length;

            loadForm(myReview);
        } else {
            // Get the number of reviews
            number_of_reviews = reviews.length - 1;

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
            for ( let i = 0; i < myReviewData.score; i ++){
                cardScore.appendChild(fullStar.cloneNode());
            }
            for ( let i = myReviewData.score; i < 5; i ++){
                cardScore.appendChild(emptyStar.cloneNode());
            }
            var cardButtons = document.createElement('ul');
            cardButtons.classList = "list-group list-group-flush text-right";
            cardButtonsDiv = document.createElement('div');
            var editReviewButton = document.createElement('button');
            editReviewButton.classList = "btn btn-primary m-2";
            editReviewButton.innerHTML = "Modifica";
            editReviewButton.addEventListener('click', function(e){editReview(myReviewData)}, false);
            var deleteReviewButton = document.createElement('button');
            deleteReviewButton.classList = "btn btn-primary m-2";
            deleteReviewButton.innerHTML = "Elimina";
            deleteReviewButton.addEventListener('click', function(e){deleteReview(myReviewData._id)}, false);

            var cardText = document.createElement('li');
            cardText.classList = "list-group-item";
            cardText.style = "white-space: pre-wrap;";
            cardText.innerHTML = myReviewData.text;

            cardButtonsDiv.appendChild(editReviewButton);
            cardButtonsDiv.appendChild(deleteReviewButton);
            cardButtons.appendChild(cardButtonsDiv);
            cardTitleGroup.appendChild(cardTitle);
            cardListGroup.appendChild(cardScore);
            cardListGroup.appendChild(cardText);
            cardListGroup.appendChild(cardButtons);
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

        var title = document.createElement('h3');
        title.innerHTML = "Le recensioni di altri utenti";

        reviewsContainer.appendChild(title);

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
            for ( let j = 0; j < review.score; j ++){
                cardScores[i].appendChild(fullStar.cloneNode());
            }
            for ( let j = review.score; j < 5; j ++){
                cardScores[i].appendChild(emptyStar.cloneNode());
            }
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

// Function that interacts with the API and sends the data from the form to create a new review
function createReview(){
    var url_string = window.location.href;
    var url = new URL(url_string);
    var productId = url.searchParams.get("id");
    var userId = localStorage.getItem('user_id');

    if (userId == null){
        window.location.href = "product_details.html?id=" + productId;
        return;
    }

    //get data from the form
    var title = $("#title").val();
    var text = $("#text").val();
    var score = scoreValue;

    if (!title || title.length < 0) {
        return;
    }

    if (!text || text.length < 0) {
        return;
    }

    if (!score || score < 1 || score > 5){
        return;
    }

    var review = {
        title: title,
        score: score,
        text: text,
        productId: productId,
        userId: userId
    }

    fetch('../api/v1/reviews/', {
        method: 'POST',
        headers: { 'Content-type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                    'user-id': localStorage.getItem('user_id')
        },
        body: JSON.stringify(review),
    })
    .then(resp => {
        if (!resp.ok) {
            if (resp.status == 400) {
                console.log("Errore 400: Alcuni dati sono errati");
            } else {
                console.log("Errore 500: Errore di comunicazione con il server");
            }
        } else {
            resp.json();
        }
    })

    .then(function() {
        window.location.href = "product_details.html?id=" + productId;
        return;
    }).catch(error => {
        console.log(error);
    });
}

// This function interacts with the API to edit the review
function submitEditedReview(reviewId){
    var url_string = window.location.href;
    var url = new URL(url_string);
    var productId = url.searchParams.get("id");
    var userId = localStorage.getItem('user_id');

    if (userId == null){
        window.location.href = "product_details.html?id=" + productId;
        return;
    }

    //get data from the form
    var title = $("#title").val();
    var text = $("#text").val();
    var score = scoreValue;

    if (!title || title.length < 0) {
        return;
    }

    if (!text || text.length < 0) {
        return;
    }

    if (!score || score < 1 || score > 5){
        return;
    }

    var review = {
        title: title,
        score: score,
        text: text,
        productId: productId,
        userId: userId
    }

    fetch('../api/v1/reviews/' + reviewId, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                    'user-id': localStorage.getItem('user_id')
        },
        body: JSON.stringify(review),
    })
    .then(resp => {
        if (!resp.ok) {
            if (resp.status == 400) {
                console.log("Errore 400: Alcuni dati sono errati");
            } else {
                console.log("Errore 500: Errore di comunicazione con il server");
            }
        } else {
            resp.json();
        }
    })

    .then(function() {
        window.location.href = "product_details.html?id=" + productId;
        return;
    }).catch(error => {
        console.log(error);
    });
}

// This function interacts with the API to delete a review
function deleteReview(reviewId){
    var url_string = window.location.href;
    var url = new URL(url_string);
    var productId = url.searchParams.get("id");

    if (localStorage.getItem('user_id') == null){
        window.location.href = "product_details.html?id=" + productId;
        return;
    }

    fetch('../api/v1/reviews/' + reviewId, {
        method: 'DELETE',
        headers: { 'Content-type': 'application/json',
                    'x-access-token': localStorage.getItem('token'),
                    'user-id': localStorage.getItem('user_id')
        }
    })
    .then(function() {
        window.location.href = "product_details.html?id=" + productId;
        return;
    }).catch(error => {
        console.log(error);
    });
}

// This function loads the "edit review" form and gives it the current review data
function editReview(review){
    const myReview = document.getElementById('myReview');
    myReview.innerHTML = '';
    loadForm(myReview, review);
}

/**---------------------------------- 
 * Manage of add the product in cart
 * ----------------------------------
*/
function viewStatusCart(st, res) {
    var msg = "";
    $('#modalAggiungiAlCarrello').modal('hide');
    if( st==400 ){
        if( res.error!=null && res.error!="" ){
            msg = res.error;
        }else{
            msg = "Accedere per usare la funzionalità";
        }
    }else if( st==403 || st==401 ){
        msg = "Permesso non consentito";
        document.getElementById("btnMLogin").style.display = "block";
    }else if( st==404 ){
        if( res.message == 'Product not available (this amount + amount in cart)' ){
            msg = "Prodotti non disponinili considerando prodotti già salvati in carrello";
        }else{
            msg = "Prodotti non disponibili";
        }
    }else if( st==500 ){
        msg = "Errore server, riprova più tardi";
    }else{
        msg = "Aggiunti prodotti al carrello";
    }
    document.getElementById("modalMsg").innerText = `${msg}`;
    $("#modalError").modal("show");
}

var computeAv = false;
/**
 * View products available
 */
function viewProductsAvailable(){
    if( !computeAv ){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var product_id = url.searchParams.get("id");

        var user_id = localStorage.getItem('user_id');
        var token = localStorage.getItem('token');
        var status;
        fetch( `../api/v1/products/${product_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token,
                'user-id': user_id
            }
        } )
        .then( function (resp) {
            status = resp.status;
            return resp;
        } )
        .then( (resp) => resp.json() )
        .then( function (data) {
            if( status==200 ){
                am = document.createElement('span');
                am.innerHTML = data.amount;
                document.getElementById( 'outAmount' ).appendChild(am);
                document.getElementById( 'inAmount' ).max = data.amount;
                computeAv = true;
            }else{
                viewStatusCart(status, data);
            }
        })
        .catch(error => console.error(error));
    }
}

/*
 * To control format of inputs
 */
function ctrlInput(){
    //control of "n° prodotti"
    var amount = document.getElementById("inAmount").value;
    if( isNaN(amount) || amount<1 ){
        alertInput("Numero prodotti selezionati non valido");
        return false;
    }

    return true;
}

/*
 * Add a Product in the cart
 */
function addInCart(){
    document.getElementById("btnTAggiungi").style.display = "none";
    document.getElementById("loadAggiungi").style.display = "block";
    document.getElementById("btnAggiungi").disable = true;
    /*
     * control of input data,
     * control of token
     */
    var url_string = window.location.href;
    var url = new URL(url_string);
    var product_id = url.searchParams.get("id");

    var user_id = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');

    //control of input
    if( !ctrlInput() ){
        document.getElementById("loadAggiungi").style.display = "none";
        document.getElementById("btnTAggiungi").style.display = "block";
        document.getElementById("btnAggiungi").disable = false;
        return;
    }

    //compute address
    var amount = document.getElementById("inAmount").value;

    //request to server
    var status;
    fetch(`../api/v1/carts/`+product_id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
            'user-id': user_id
        },
        body: JSON.stringify({
            amount: amount
        })
    })
    .then(function (resp) {
        status = resp.status;
        return resp;
    })
    .then((resp) => resp.json())
    .then(function (data) {
        document.getElementById("loadAggiungi").style.display = "none";
        document.getElementById("btnTAggiungi").style.display = "block";
        document.getElementById("btnAggiungi").disable = false;
        viewStatusCart(status, data);
        fetch('../api/v1/carts/', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'x-access-token': localStorage.getItem('token'),
                'user-id': localStorage.getItem('user_id')
            }
        })
        .then(resp => resp.json())
        .then(cart => $("#navbar_cart_total").text(cart.length));
    })
    .catch(error => console.error(error));

}
