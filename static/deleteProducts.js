
//It fetches the values of the textfields and updates the product with the id specified in the URL

function deleteProduct(productId){

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
        amount: 0
      })
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
                    $("#deleteProduct").modal("hide");
                    $("#success_modal_body").text('L\'articolo è stato eliminato correttamente');
                    $("#success_modal").modal("show");
                  }
                  return resp.json()})
  .catch(error => console.error(error));
}
