$("#register-btn").on("click", function (e) {
  e.preventDefault();

  let btnHTML = $(this).html();
  $(this).html("<img id='loader' src='images/loader.svg' alt='Loading...!' />");

  let myData = {
    "nombre": document.getElementById("fullname").value,
    "correo": document.getElementById("email").value,
    "password": document.getElementById("email").value,
    "celular": "12334562",
    "nivel": "USUARIO",
  };
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/registroUser",
    method: "POST",
    data: myData,
    success: function (response) {
      $("#register-btn").html(btnHTML);
      console.log(response);
      $("#register-form").trigger("reset");
      changeForm($(".login-register-btn"));
    },
    error: function (er) {
      console.log(er);
    },
  });
});

$("#login-btn").on("click", function () {
  let btnHTML = $(this).html();
  $(this).html("<img id='loader' src='images/loader.svg' alt='Loading...!' />");
  // const Toast = Swal.mixin();
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/loginUser",
    method: "POST",
    data: $("#login-form").serialize()
  }).done(function (resp) {

    //NUESTRO SERVICIO RETORNARA UN TOKEN QUE ES EL
    // QUE OCUPAREMOS PARA MANEJAR LA SESION DEL USUARIO
    if (!resp.err) {
      if (resp.nivel == 'CLIENTE') {
        //aqui estamos guardando la foto de perfil del usuario          
        localStorage.setItem('fotoPerfil', resp.foto)
        let token = resp.token;
        firebase
          .auth()
          .signInWithCustomToken(token)
          .then(function (data) {
            $("#login-btn").html(btnHTML);
            if (data.user.uid != "") {
              window.location.href = "chat.php";
            }
          }).catch(function (error) {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            alert(errorMessage);
          });
      } else {
        $("#login-btn").html(btnHTML);
        // Toast.fire({
        //   title: 'Oops...',
        //   icon: 'error',
        //   text: 'No tienes los permisos necesarios',
        //   showConfirmButton: true,
        // });
        console.log("No tienes los permisos necesarios");
      }
    } else {
      // Toast.fire({
      //   title: 'Oops...',
      //   icon: 'error',
      //   text: 'Credenciales no validas',
      //   showConfirmButton: true,
      // });
      console.log("Credenciales no validas")
    }

  }).fail(function (resp) {

    if (resp.responseJSON.err) {
      if (resp.responseJSON.mensaje == 'EMAIL_NOT_FOUND') {
        console.log("Correo electrónico no registrado")
        // Toast.fire({
        //   title: 'Oops...',
        //   icon: 'error',
        //   text: 'Correo electrónico no registrado',
        //   showConfirmButton: true,
        // });
      }
      else if (resp.responseJSON.mensaje == 'INVALID_EMAIL') {
       console.log("Correo electrónico no valido")
        // Toast.fire({
        //   title: 'Oops...',
        //   icon: 'error',
        //   text: 'Correo electrónico no valido',
        //   showConfirmButton: true,
        // });
      }
    } else {
    console.log("Credenciales no validas")
      // Toast.fire({
      //   title: 'Oops...',
      //   icon: 'error',
      //   text: 'Credenciales no validas',
      //   showConfirmButton: true,
      // });
    }
    $("#login-btn").html(btnHTML);

  });;
});

$(".login-register-btn").on("click", function () {
  changeForm(this);
});

function changeForm($this) {
  $($this).children("span").toggleClass("active");

  $(".content").toggleClass("active");
}
$(".card input").on("focus blur", function () {
  $(".card").toggleClass("active");
});

