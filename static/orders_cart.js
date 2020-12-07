VIS = 0;

/*
 * This function is used to change the visibility of button to confirm the order of a product
 */
function viewBtnForBuy() {
    if( VIS==0 ){
        document.getElementById("btnTAcquista").style.display = "none";
        document.getElementById("loadAcquista").style.display = "block";
        document.getElementById("btnAcquista").disable = true;
    }else if( VIS==1 ){
        document.getElementById("loadAcquista").style.display = "none";
        document.getElementById("btnTAcquista").style.display = "block";
        document.getElementById("btnAcquista").disable = false;
    }else{
        var elem = document.getElementById('loadAcquista');
        elem.parentNode.removeChild(elem);
        var elem2 = document.getElementById('btnAcquista');
        elem2.parentNode.removeChild(elem2);
        var elem3 = document.getElementById('btnAnnulla');
        elem3.parentNode.removeChild(elem3);
    }
    return;
}

/*
 * Function that view an alert if a input is bad format
 */
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

/*
 * Function to view the response fo server
 */
function viewStatusOrder(st, res) {
    var msg = "";
    var vis;
    if( st==400 ){
        msg = msg + "Problema formato dati inviati";
        vis = 2;
    }else if( st==403 ){
        msg = "Permesso non consentito";
        document.getElementById("btnMLogin").style.display = "block";
        vis = 1;
    }else if( st==404 ){
        //inserire lista prodotti modificati
        if( res.error=='User not found' ){
            msg = "Utente non valido";
            document.getElementById("btnMLogin").style.display = "block";
            vis = 1;
        }else if( res.message=='Products not found in cart' ){
            msg = "Prodotti non trovati nel carrello";
            vis = 2;
        }else{
            msg = msg + `<div class="card">
                            <h5 class="card-header">Prodotti cancellati dal carrello</h5>
                            <div class="card-body">
                                <ul class="list-group">`;
            res.del.forEach(function(del){
                msg = msg + `<li class="list-group-item">
                                ${del.name}
                            </li>`;
            });
            msg = msg + `   </div>
                        </div>
                        <hr/>
                        <div class="card">
                        <h5 class="card-header">Prodotti aggiornati nel carrello</h5>
                        <div class="card-body">
                            <ul class="list-group">`;
            res.up.forEach(function(up){
                    msg = msg + `<li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${up.name}
                                    <span class="badge badge-primary badge-pill">${up.amount}</span>
                                </li>`;
            });
            msg = msg + `       </ul>
                            </div>
                        </div>`;
            vis = 2;
        }
    }else if( st==500 ){
        msg = "Errore server, riprova più tardi";
        vis = 1;
    }else{
        msg = "Prodotti comprati con successo";
        vis = 2;
    }

    document.getElementById("modalMsg").innerHTML = `${msg}`;
    $("#modalError").modal("show");
    return vis;
}

/*
 * To control format of inputs
 */
function ctrlInput(){

    //control of "provincia"
    var pr = document.getElementById("inProvincia").value
    if( pr==null || pr=="" ){
        alertInput("Provincia non valida");
        return false;
    }

    //control of "comune"
    var com = document.getElementById("inComune").value
    if( com==null || com=="" ){
        alertInput("Comune non valido");
        return false;
    }

    //control of "via/localita'"
    var via = document.getElementById("inVia/localita").value
    if( via==null || via=="" ){
        alertInput("Via/localit&#224 non valido");
        return false;
    }

    //control of "numero civico"
    var civ = document.getElementById("inCivico").value;
    if( isNaN(civ) || civ<1 ){
        alertInput("Numero civico non valido");
        return false;
    }

    //control number of credit card
    var numCard = document.getElementById("inNumCard").value;
    if( isNaN(numCard) || numCard<1 ){
        alertInput("Numero carta non valido");
        return false;
    }

    //control expiration month
    var cur_year = false;
    var expYCard = document.getElementById('inYExpCard').value
    var d = new Date();
    if( isNaN(expYCard) || expYCard=="" || parseInt(expYCard)<d.getFullYear() ){
        alertInput("Numero anno scadenza carta non valido");
        return false;
    }else{
        cur_year = parseInt(expYCard) == d.getFullYear();
    }

    //control expiration month
    var expMCard = document.getElementById('inMExpCard').value;
    if( isNaN(expMCard) || expMCard=="" || (expMCard<1 || expMCard>12) || (cur_year && parseInt(expMCard)<d.getMonth()) ){
        alertInput("Numero mese scadenza carta non valido");
        return false;
    }

    return true;
}

/*
 * Fuction to send a request to confirm a order
 */
function createOrders(){

    viewBtnForBuy();
    VIS = 1;
    /*
     * control of input data,
     * control of token
     */
    var user_id = localStorage.getItem('user_id');
    var token = localStorage.getItem('token');

    //control of input
    if( !ctrlInput() ){
        viewBtnForBuy();
        VIS = 0;
        return;
    }

    //compute address
    var address = document.getElementById("inVia/localita").value + " " +
              document.getElementById("inCivico").value + " " +
              document.getElementById("inComune").value + " " +
              document.getElementById("inProvincia").value;
    var numCard = document.getElementById("inNumCard").value;
    var expCard = document.getElementById('inMExpCard').value + "/" + document.getElementById('inYExpCard').value;

    //request to server
    var status;
    fetch(`../api/v1/carts/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
            'user-id': user_id
        },
        body: JSON.stringify({
            address: address,
            numCard: numCard,
            expCard: expCard
        }),
    })
    .then(function (resp) {
        status = resp.status;
        return resp;
    })
    .then((resp) => resp.json())
    .then(function (data) {
        VIS = viewStatusOrder(status, data);
        viewBtnForBuy();
        $('#modalAcquistoCarrello').modal('hide');
    })
    .catch(error => console.error(error));
}
