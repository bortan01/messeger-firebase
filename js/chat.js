let chat_data = {},
  user_uuid,
  foto,
  chatHTML = "",
  chat_uuid = "",
  userList = [];
let newMessage = "";

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    user_uuid = user.uid;
    getUsers();
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
    url: "http://localhost/API-REST-PHP/Usuario/obtenerUsuario",
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
              "<span>Last Login</span>" +
              "</div>" +
              "</div>";

            userList.push({ user_uuid: value.uuid, username: value.nombre });
          } else {
            foto = value.foto
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
  let name = $(this).find("strong").text();
  let user_1 = user_uuid;
  let user_2 = $(this).attr("uuid");
  $(".message-container").html("Connecting...!");

  $(".name").text(name);

  $.ajax({
    url: "http://localhost/API-REST-PHP/Usuario/obtenerChat",
    method: "POST",
    data: { connectUser: 1, user_1: user_1, user_2: user_2 },
    success: function (resp) {
      console.log(resp);

      chat_data = {
        chat_uuid: resp.message.chat_uuid,
        user_1_uuid: resp.message.user_1_uuid,
        user_2_uuid: resp.message.user_2_uuid,
        user_1_name: "",
        user_2_name: name,
      };
      $(".message-container").html("Say Hi to " + name);
      db.collection("chat")
        .where("chat_uuid", "==", chat_data.chat_uuid)
        .orderBy("time")
        .get()
        .then(function (querySnapshot) {
          chatHTML = "";
          querySnapshot.forEach(function (doc) {
            console.log(doc.data());
            if (doc.data().user_1_uuid == user_uuid) {
              chatHTML +=
                '<div class="message-block">' +
                '<div class="user-icon"><img  src="' + foto + '" class="user-icon"/></div>' +
                '<div class="message">' +
                doc.data().message +
                "</div>" +
                "</div>";
            } else {
              chatHTML +=
                '<div class="message-block received-message">' +
                '<div class="user-icon"><img  src="' + foto + '" class="user-icon"/></div>' +
                '<div class="message">' +
                doc.data().message +
                "</div>" +
                "</div>";
            }
          });

          $(".message-container").html(chatHTML);
        });

      if (chat_uuid == "") {
        chat_uuid = chat_data.chat_uuid;
        realTime();
      }
    },
  });
});

$(".send-btn").on("click", function () {
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
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", error);
      });
  }
});

function realTime() {
  db.collection("chat")
    .where("chat_uuid", "==", chat_data.chat_uuid)
    .orderBy("time")
    .onSnapshot(function (snapshot) {
      newMessage = "";
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          console.log(change.doc.data());

          if (change.doc.data().user_1_uuid == user_uuid) {
            newMessage +=
              '<div class="message-block">' +
              '<div class="user-icon"><img  src="' + foto + '" class="user-icon"/></div>' +
              '<div class="message">' +
              change.doc.data().message +
              "</div>" +
              "</div>";
          } else {
            newMessage +=
              '<div class="message-block received-message">' +
              '<div class="user-icon"><img  src="' + foto + '" class="user-icon"/></div>' +
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

      $(".chats").scrollTop($(".chats")[0].scrollHeight);
    });
}
