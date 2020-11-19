function alertInput(msg) {
    document.getElementById("alert_container").innerHTML = `
    <div id="alrt" class="alert alert-danger alert-dismissible" runat ="server" id="modalEditError" visible ="false">
        <button class="close" type="button" onclick="var elem = document.getElementById('alrt');
                                                      elem.parentNode.removeChild(elem);">&times;</button>
        ${msg}
    </div>
    `;
}

function ctrlInput() {

    //control of "provincia"
    var pr = document.getElementById("inProvincia").value
    if (pr == null || pr == "") {
        alertInput("Provincia non valida");
        return false;
    }

    //control of "comune"
    var com = document.getElementById("inComune").value
    if (com == null || com == "") {
        alertInput("Comune non valido");
        return false;
    }

    //control of "via/localita'"
    var via = document.getElementById("inVia/localita'").value
    if (via == null || via == "") {
        alertInput("Via/localita' non valido");
        return false;
    }

    //control of "numero civico"
    var civ = document.getElementById("inCivico").value;
    if( isNaN(civ) || civ<1 ) {
        alertInput("Numero civico non valido");
        return false;
    }

    //control number of credit card
    var numCard = document.getElementById("inNumCard").value;
    if (isNaN(numCard) || numCard<1 ) {
        alertInput("Numero carta non valido");
        return false;
    }

    //control expiration month
    var cur_year = false;
    var expYCard = document.getElementById('inYExpCard').value
    var d = new Date();
    if (isNaN(expYCard) || expYCard=="" || parseInt(expYCard)<d.getFullYear()) {
        alertInput("Numero anno scadenza carta non valido");
        return false;
    } else {
        cur_year = parseInt(expYCard) == d.getFullYear();
    }

    //control expiration month
    var expMCard = document.getElementById('inMExpCard').value;
    if (isNaN(expMCard) || expMCard=="" || (expMCard < 1 || expMCard > 12) || (cur_year && parseInt(expMCard)<d.getMonth()) ) {
        alertInput("Numero mese scadenza carta non valido");
        return false;
    }

    return true;
}

function createOrder() {

    /*
     * insert control of input data,
     * insert control of token
     */

    var url_string = window.location.href;
    var url = new URL(url_string);
    //var product_id = url.searchParams.get("id");
    var product_id = "5fb54de34008a6127427f71b";

    //var user_id = localStorage.getItem('user_id');
    //var token = localStorage.getItem('token');
    var user_id = "5fb291268c27d33204eaf0d3";
    var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDU3ODE3NjUsImV4cCI6MTYwNTg2ODE2NX0.wGwfiFv_GYlsdgqfyseX7kIOWqJ57iVz9IBESrUhHOM";

    //control of input
    if (!ctrlInput()) {
        return;
    }

    //compute address
    address = document.getElementById("inVia/localita'").value + " " +
              document.getElementById("inCivico").value + " " +  
              document.getElementById("inComune").value + " " +
              document.getElementById("inProvincia").value;  

    numCard = document.getElementById("inNumCard").value;
    expCard = document.getElementById('inMExpCard').value + "/" + document.getElementById('inYExpCard').value;

    //request to server
    fetch(`../api/v1/order/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': token },
        body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
    })
    .then(function (data) {
        console.log(data);
        console.log("order done!");
    })
    .catch(error => console.error(error));
}