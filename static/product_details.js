/**
 * This function gets details of a product
 */
function loadProduct() {

    const ul = document.getElementById('product');

    ul.innerHTML = '';

    var url_string = window.location.href;
    var url = new URL(url_string);
    var id = url.searchParams.get("id");
    console.log(id);

    fetch(`../api/v1/products/${id}`)
    .then((resp) => resp.json()) // Transform the data into json
    .then(function(product) { // Here you get the data
        
        // console.log(product);
        let li = document.createElement('li');
        let span = document.createElement('span');
        let br = document.createElement('br');
        let button = document.createElement('button'); //PLACEHOLDER PER PULSANTE ACQUISTO
        span.innerHTML = `<a> Nome:${product.name} Descrizione:${product.description} Prezzo:${product.price} Quantità:${product.amount}</a>`;
        button.href = "#";
        button.innerHTML = "Acquista";
        // Append all our elements
        li.appendChild(span);
        li.appendChild(button); 
        ul.appendChild(br);
        ul.appendChild(li);
    })
    .catch( error => console.error(error) );// If there is any error you will catch them here
}