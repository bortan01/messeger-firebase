$("#register-btn").on("click", function (e) {
  e.preventDefault();

  let btnHTML = $(this).html();
  $(this).html("<img id='loader' src='images/loader.svg' alt='Loading...!' />");

  let myData = {
    "nombre": document.getElementById("fullname").value,
    "correo" : document.getElementById("email").value,
    "password" : document.getElementById("email").value,
    "celular" : "12334562",
    "nivel" : "USUARIO",
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

  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/loginUser",
    method: "POST",
    data: $("#login-form").serialize(),
    success: function (resp) {
      if (!resp.err) {
        let token = resp.token;
        console.log(resp.message);
        firebase
          .auth()
          .signInWithCustomToken(token)
          .catch(function (error) {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;

            alert(errorMessage);
          })
          .then(function (data) {
            $("#login-btn").html(btnHTML);
            if (data.user.uid != "") {
              window.location.href = "chat.php";
            }
          });
      } else {
        alert(response.message);
      }
    },
  });
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

