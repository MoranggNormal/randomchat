var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var uuid = require("uuid-random");

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  names,
} = require("unique-names-generator");

// Running our server on port 3080
var PORT = process.env.PORT || 3080;

var server = app.listen(PORT, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://%s:%s", "localhost:", port);
});

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var io = require("socket.io")(server);

var chatRoomData = [];
var connectedClients = {};

io.on("connection", (client) => {
  console.log("New client connected");

  //Client sent a message
  client.on("SendMessage", (messageData) => {
    chatRoomData.push(messageData);
    sendUpdateChatRoomData(client);
  });

  //Client entered the chat room
  client.on("UserEnteredRoom", (userdata) => {
    var enteredRoomMessage = {
      message: `${userData.username} has entered the chat`,
      username: "",
      useID: 0,
      timeStam: null,
    };
    chatRoomData.push(enteredRoomMessage);
    sendUpdateChatRoomData(client);
    connectedClients[client.id] = userData;
  });

  //Creating identity for new connected user
  client.on("CreateUserData", () => {
    let userID = uuid();
    let username = uniqueNamesGenerator({ dictonaries: [adjectives, names] });
    var userData = { userID: userID, username: username };
    client.emit("SetUserData", userData);
  });

  //Player disconnecting from chat room...
  client.on("disconnecting", (data) => {
    console.log("Client disconnecting");

    if (connectedClients[client.id]) {
      var leftRoomMessage = {
        message: `${connectedClients[client.id].username} has left the chat`,
        username: "",
        userID: 0,
        timeStam: null,
      };
      chatRoomData.push(leftRoomMessage);
      sendUpdateChatRoomData(client);
      delete connectedClients[client.id];
    }
  });

  //Clearing Chat room data from server
  client.on("ClearChat", () => {
    chatRoomData = [];
    console.log(chatRoomData);
    sendUpdateChatRoomData(client);
  });
});

//Sending update chat room data to all connected clients

function sendUpdateChatRoomData(client) {
  client.emit("RetrieveChatRoomData", chatRoomData);
  client.broadcast.emit("RetrieveChatRoomData", chatRoomData);
}
