$("#register-btn").on("click", function (e) {
  e.preventDefault();

  var btnHTML = $(this).html();
  $(this).html("<img id='loader' src='images/loader.svg' alt='Loading...!' />");

  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/registroUser",
    method: "POST",
    data: $("#register-form").serialize(),
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
  var btnHTML = $(this).html();
  $(this).html("<img id='loader' src='images/loader.svg' alt='Loading...!' />");

  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/loginUser",
    method: "POST",
    data: $("#login-form").serialize(),
    success: function (resp) {
      console.log(resp);
      if (!resp.err) {
      

        $("#login-btn").html(btnHTML);
        if (resp.user_uuid != "") {
          window.location.href = "chat.php";
        }
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
