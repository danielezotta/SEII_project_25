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

        var buy = document.createElement('button');
        buy.addEventListener('click', function(e){window.location.href='new_order.html?id='+product._id}, false);
        buy.style = "margin-right: 5px";
        buy.classList = "btn btn-secondary";
        buy.innerHTML = "Acquista"; 
        
        var cart = document.createElement('button');
        cart.addEventListener('click', function(e){viewProductsAvailable();$("#modalAggiungiAlCarrello").modal("show");}, false);
        cart.classList = "btn btn-secondary";
        cart.innerHTML = "Aggiungi al carrello";
        
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
}

function viewStatusCart(st, res) {
    var msg = "";
    $('#modalAggiungiAlCarrello').modal('hide');
    if( st==400 ){
        if( res.error!=null && res.error!="" ){
            msg = msg + "Problema formato dati inviati";
        }
    }else if( st==403 ){
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
    })
    .catch(error => console.error(error));
}