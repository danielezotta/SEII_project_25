
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

  //It controls the correctness of the user ID
  var userId = document.getElementById("userId").value;
  if(!userId || typeof userId != 'string'){
      alertInput('Il campo "ID utente" non può essere vuoto e deve essere un numero maggiore di zero');
      return false;
  }
  console.log("HO CONTROLLATO I PARAMETRI");

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
  var userId = document.getElementById("userId").value;

  fetch('../api/v1/products', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          name: nameProduct,
          image: image,
          description: description,
          price: price,
          amount: amount,
          userId: userId
      }),
  })
  .then((resp) => {
                    if(resp.status==500){
                      //$("#error_modal").modal("show");
                    }
                    else if(resp.status==201){
                      $("#success_modal").modal("show");
                      //console.log(resp.status);
                    }
                    return resp.json()})
  .catch(error => console.error(error));
}
