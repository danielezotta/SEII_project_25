
//Alert message, it creates a message in case of error specifing the text of error

function alertInput(msg){
    var d = document.createElement("DIV");
    document.getElementById("alert_container").appendChild(d);
    d.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;
    return;
}

//It handles the page based on if the user wants to sell a product or update it

function handlePage(){
  var url_string = window.location.href;
  var url = new URL(url_string);
  var productId = url.searchParams.get("id");

  if(!productId){
    document.write(`<button id="btnVendi" type="button" class="btn btn-secondary" onclick="addProduct()">
        <span id="loadVendita"  style="display:none" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span id="btnVendita" style="display:block">Metti in vendita</span>
    </button>`);

  }
  else{
    document.write(`<button id="btnAggiorna" type="button" class="btn btn-secondary" onclick="updateProduct()">
        <span id="loadVendita"  style="display:none" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span id="btnVendita" style="display:block">Aggiorna annuncio</span>
    </button>`);
    fillFields(productId);
  }
}

//It fills the fields with product that has to be modified

function fillFields(id){
  fetch(`../api/v1/products/${id}`)
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(product) { // Here you get the data

      var nameProduct = document.getElementById('nameProduct');
      nameProduct.value = product.name;
      var image = document.getElementById('image');
      image.value = product.image;
      var description = document.getElementById('description');
      description.value = product.description;
      var price = document.getElementById('price');
      price.value = product.price;
      var amount = document.getElementById('amount');
      amount.value = product.amount;
  })
  .catch( error => console.error(error) );
}

//It controls that the textfields are correctly compiled

function parametersControl(){

  //It controls the correctness of the name of the product
  var nameProduct = document.getElementById("nameProduct").value;
  var nameProductWithoutSpace = nameProduct.split(' ').join('');
  if(!nameProduct || nameProductWithoutSpace==""){
      alertInput('Il campo "Nome prodotto" non può essere vuoto');
      return false;
  }


  //It controls the correctness of the image
  var image = document.getElementById("image").value;
  var imageWithoutSpace = image.split(' ').join('');
  if(!image || imageWithoutSpace==""){
      alertInput('Il campo "Immagine" non può essere vuoto');
      return false;
  }

  //It controls the correctness of the description
  var description = document.getElementById("description").value;
  var descriptionWithoutSpace = description.split(' ').join('');
  if(!description || descriptionWithoutSpace==""){
      alertInput('Il campo "Descrizione" non può essere vuoto');
      return false;
  }

  //It controls the correctness of the price
  var price = document.getElementById("price").value;
  if(!price || isNaN(price)){
      alertInput('Il campo "Prezzo" non può essere vuoto e deve essere un numero maggiore di zero');
      return false;
  }

  //It controls the correctness of the amount
  var amount = document.getElementById("amount").value;
  if(!amount || isNaN(amount)){
      alertInput('Il campo "Amount" non può essere vuoto e deve essere un numero intero maggiore di zero');
      return false;
  }

  return true;
}

//It fetches the values of the textfields and adds them into the database

function addProduct(){

  if(!parametersControl()){
    return;
  }

  var nameProduct = document.getElementById("nameProduct").value;
  var image = document.getElementById("image").value;
  var description = document.getElementById("description").value;
  var price = document.getElementById("price").value;
  var amount = document.getElementById("amount").value;

  var token = localStorage.getItem('token');
  var user_id = localStorage.getItem('user_id');

  fetch('../api/v1/products', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'user-id': user_id,
          'x-access-token': token
      },
      body: JSON.stringify({
          name: nameProduct,
          image: image,
          description: description,
          price: price,
          amount: amount
      }),
  })
  .then((resp) => {
                  if(!resp.ok){
                    if(resp.status==500){
                      $("#error_modal_title").text("Errore 500");
                      $("#error_modal_body").text('Problemi con il server');
                    }
                    else if(resp.status==403){
                      console.log("ERRORE 403");
                      $("#error_modal_title").text("Errore 403");
                      $("#error_modal_body").text('Token d\'autenticazione scaduto');
                    }
                    else if(resp.status==401){
                      console.log("ERRORE 401");
                      $("#error_modal_title").text("Errore 403");
                      $("#error_modal_body").text('Nessun token fornito');
                    }
                    $("#error_modal").modal("show");
                  }
                  else if(resp.status==201){
                    $("#success_modal_body").text('L\'articolo è stato pubblicato correttamente');
                    $("#success_modal").modal("show");
                  }
                  return resp.json()})
  .catch(error => console.error(error));
}

//It fetches the values of the textfields and updates the product with the id specified in the URL

function updateProduct(){

  var url_string = window.location.href;
  var url = new URL(url_string);
  var productId = url.searchParams.get("id");

  if(!parametersControl()){
    return;
  }

  var nameProduct = document.getElementById("nameProduct").value;
  var image = document.getElementById("image").value;
  var description = document.getElementById("description").value;
  var price = document.getElementById("price").value;
  var amount = document.getElementById("amount").value;

  var token = localStorage.getItem('token');
  var user_id = localStorage.getItem('user_id');

  fetch(`../api/v1/products/${productId}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'user-id': user_id,
          'x-access-token': token
      },
      body: JSON.stringify({
          name: nameProduct,
          image: image,
          description: description,
          price: price,
          amount: amount
      }),
  })
  .then((resp) => {
                  if(!resp.ok){
                    if(resp.status==500){
                      $("#error_modal_title").text("Errore 500");
                      $("#error_modal_body").text('Problemi con il server');
                    }
                    else if(resp.status==403){
                      console.log("ERRORE 403");
                      $("#error_modal_title").text("Errore 403");
                      $("#error_modal_body").text('Token d\'autenticazione scaduto');
                    }
                    else if(resp.status==401){
                      console.log("ERRORE 401");
                      $("#error_modal_title").text("Errore 403");
                      $("#error_modal_body").text('Nessun token fornito');
                    }
                    $("#error_modal").modal("show");
                  }
                  else if(resp.status==200){
                    $("#success_modal_body").text('L\'articolo è stato aggiornato correttamente');
                    $("#success_modal").modal("show");
                  }
                  return resp.json()})
  .catch(error => console.error(error));
}
