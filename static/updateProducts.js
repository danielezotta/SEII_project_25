
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
