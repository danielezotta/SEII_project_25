function logout() {

    window.localStorage.removeItem('user_id');
    window.localStorage.removeItem('token');
    window.location.href = "index.html";

};

$(document).ready(function(){
    logout(); 
});
