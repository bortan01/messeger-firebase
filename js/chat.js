let chat_data = {},
  user_uuid,
  fotoEmisor,
  fotoReceptor,
  chatViejo,
  chatHTML = "",
  chat_uuid = "",
  userList = [];
let newMessage = "";
let referenciaRT;
let activarSonido = false;
let proximaConsulta;
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    user_uuid = user.uid;
    $('#btn-enviar').prop('disabled', true);
    getUsers();
    // if (history.state) {
    //   console.log(history.state)
    //   fotoReceptor = history.state.fotoReceptor;
    //   cargarChats(user_uuid, history.state.lastUuid);
    // }
  } else {
    console.log("Not sign in");
  }
});

function logout() {
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/logout",
    method: "POST",
    data: { logoutUser: 1 },
    success: function (response) {
      console.log(response);
      firebase
        .auth()
        .signOut()
        .then(function () {
          console.log("Logout");
          window.location.href = "index.php";
        })
        .catch(function (error) {
          // An error happened.
          console.log("Logout Fail");
        });
    },
  });
}

function getUsers() {
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/obtenerUsuarioByChat",
    method: "GET",
    data: { getUsers: 1 },
    success: function (response) {
      if (!response.error) {
        let users = response.usuarios;
        let usersHTML = "";
        let messageCount = "";
        $.each(users, function (index, value) {
          if (user_uuid != value.uuid) {
            usersHTML +=
              '<div class="user" uuid="' +
              value.uuid +
              '">' +
              // '<img  src="' + value.foto + '" class="user-image"/>' +
              '<div class="user-image"><img  src="' + value.foto + '" class="user-image"/></div>' +
              '<div class="user-details">' +
              "<span><strong>" +
              value.nombre +
              '<span class="count"></span></strong></span>' +
              "<span></span>" +
              "</div>" +
              "</div>";

            userList.push({ user_uuid: value.uuid, username: value.nombre });
          } else {
            fotoEmisor = value.foto
          }
        });

        $(".users").html(usersHTML);
      } else {
        console.log(response.message);
      }
    },
  });
}

$(document.body).on("click", ".user", function () {
  let chatNuevo = $(this);
  chatNuevo.css("background", "#cecece");
  if (chatViejo && !chatNuevo.is(chatViejo)) {
    chatViejo.css("background", "transparent");
  }
  chatViejo = chatNuevo;

  ///con esto se arregla el bug
  if (referenciaRT) {
    referenciaRT();
  }

  let name = $(this).find("strong").text();
  fotoReceptor = $(this).find('img').attr("src");
  let user_1 = user_uuid;
  let user_2 = $(this).attr("uuid");
  $(".message-container").html("Cargando Mensajes...");
  $(".name").text(name);
  $('#btn-enviar').prop('disabled', false);
  proximaConsulta = null;

  //OBTEGO LOS DATOS PARTICULARES DE ESE CHAT
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/obtenerChat",
    method: "POST",
    data: { connectUser: 1, user_1: user_1, user_2: user_2 },
    success: function (resp) {
      chat_data = {
        chat_uuid: resp.message.chat_uuid,
        user_1_uuid: resp.message.user_1_uuid,
        user_2_uuid: resp.message.user_2_uuid,
        user_1_name: "",
        user_2_name: name,
      };
      $(".message-container").empty();
      activarSonido = false;
      realTime();
    },
  });

});

function actualizarFecha(uuid) {
  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/updateFecha",
    method: "PUT",
    data: { uuid },
    success: function (resp) {
      // console.log(resp);
    },
  });
}

$(".send-btn").on("click", function () {
  enviarMensaje();
});

///CREA UN LISTERNER INTERNAMENTE PARA CREAR LOS NUEVOS MENSAJES EN PANTALLA
function realTime() {
  referenciaRT = db.collection("chat")
    .where("chat_uuid", "==", chat_data.chat_uuid)
    .orderBy("time", "desc")
    .limit(9)
    .onSnapshot(function (snapshot) {
      newMessage = "";
      snapshot.docChanges().slice().reverse().forEach(function (change) {

        if (!proximaConsulta) {
          let lastVisible = snapshot.docs[snapshot.docs.length - 1];
          proximaConsulta = db.collection("chat")
            .where("chat_uuid", "==", chat_data.chat_uuid)
            .orderBy("time", "desc")
            .startAfter(lastVisible)
            .limit(2);
        }

        if (change.type === "added") {
          if (change.doc.data().user_1_uuid == user_uuid) {
            ///debe de mostrar la foto de quien esta enviando el mensaje EMISOR
            newMessage +=
              '<div class="message-block received-message">' +
              '<div class="user-icon"><img  src="' + fotoEmisor + '" class="user-icon"/></div>' +
              '<div class="message">' +
              change.doc.data().message +
              "</div>" +
              "</div>";
          } else {
            if (activarSonido) {
              let audio = new Audio('new-ticket.mp3');
              audio.play();
            }
            //debe de mostrar la foto de quien se esta recibiendo el mensaje (la imagen que aca de darse click) RECEPTOR
            newMessage +=
              '<div class="message-block ">' +
              '<div class="user-icon"><img  src="' + fotoReceptor + '" class="user-icon"/></div>' +
              '<div class="message">' +
              change.doc.data().message +
              "</div>" +
              "</div>";
          }
        }
        if (change.type === "modified") {
        }
        if (change.type === "removed") {
        }
      });
      if (chatHTML != newMessage) {
        $(".message-container").append(newMessage);
      }
      activarSonido = true;
      $(".chats").scrollTop($(".chats")[0].scrollHeight);
    });
}

$('#message-input').keypress(function (e) {
  var keycode = (e.keyCode ? e.keyCode : e.which);
  if (keycode == '13') {
    enviarMensaje();
    e.preventDefault();
    return false;
  }
});

function enviarMensaje() {
  let message = $(".message-input").val();
  if (message != "") {
    db.collection("chat")
      .add({
        message: message,
        user_1_uuid: user_uuid,
        user_2_uuid: chat_data.user_2_uuid,
        chat_uuid: chat_data.chat_uuid,
        user_1_isView: 0,
        user_2_isView: 0,
        time: new Date(),
      })
      .then(function (docRef) {
        $(".message-input").val("");
        // console.log("Document written with ID: ", docRef.id);
        actualizarFecha(chat_data.user_2_uuid);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  }
}
$('#chats').scroll(function () {
  if ($('#chats').scrollTop() == 0) {
    console.log("cargar nuevos datos");
    activarSonido = false;

    if (proximaConsulta) {
      proximaConsulta
        .get()
        .then(function (querySnapshot) {
          let arrMessage = [];
          querySnapshot.forEach(function (doc) {
            if (doc.data().user_1_uuid == user_uuid) {
              ///debe de mostrar la foto de quien esta enviando el mensaje EMISOR
              let newMessage =
                '<div class="message-block received-message">' +
                '<div class="user-icon"><img  src="' + fotoEmisor + '" class="user-icon"/></div>' +
                '<div class="message">' +
                doc.data().message +
                "</div>" +
                "</div>";
              arrMessage.push(newMessage);
            } else {
              if (activarSonido) {
                ///HACEMOS ESTO PARA EVITAR QUE SUENE EL TONO CUANDO SE ESTA INICIALIZANDO LA DATA
                let audio = new Audio('new-ticket.mp3');
                audio.play();
              }
              //debe de mostrar la foto de quien se esta recibiendo el mensaje (la imagen que aca de darse click) RECEPTOR
              let newMessage =
                '<div class="message-block ">' +
                '<div class="user-icon"><img  src="' + fotoReceptor + '" class="user-icon"/></div>' +
                '<div class="message">' +
                doc.data().message +
                "</div>" +
                "</div>";
              arrMessage.push(newMessage);
            }
          });
          ///CON ESTO AGREGAMOS LOS NUEVOS CHAT HASTA ARRIBA 
          arrMessage.forEach(element => { $(".message-container").prepend(element); });
          //PARA CUANDO SE CARGUE LOS NUEVOS MENSAJES EL SCROLL QUEDE EN LA MISMA POSICION
          //CADA MENSAJE OCUPA 52.0 PX DE ALTURA
          $(".chats").scrollTop(arrMessage.length * 52.0);

          //PREPARAMOS EL TERRENO PARA UNA NUEVA CONSULTA
          let lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          proximaConsulta = db.collection("chat")
            .where("chat_uuid", "==", chat_data.chat_uuid)
            .orderBy("time", "desc")
            .startAfter(lastVisible)
            .limit(2);

        }).catch(function (error) {
          console.log("Error getting document:", error);
        });
    }
  }
});