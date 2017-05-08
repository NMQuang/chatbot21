//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));
var messages = [];
var sockets = [];

var state = [];
/**/
router.get('/webhook',function(req,res) {
  
  if(req.query['hub.mode'] && req.query['hub.verify_token'] == 'nmquangg21') {
    console.log('Good jpb');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.log('Fail job');
    res.status(403).end();
  }
  
});

/**/
router.post('/webhook',function(req,res) {
  var data = req.body;
  if(data && data.object === 'page') {
    
    //entry
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;
      //message
      entry.messaging.forEach(function(event) {
        if(event.message) {
          //console.log(event.message);
          processMessage(event);
        } else {
          if(event.postback && event.postback.payload) {
            console.log(event.postback.payload);
            switch(event.postback.payload) {
              case 'nmquangg':
                sendTextMessage(event.sender.id,'Hello nmquang');
                sendFirstMenu(event.sender.id);
                break;
              case 'name':
                sendTextMessage(event.sender.id,'My name is Minh Quangg. I am 21. I am from Ho Chi Minh City.');
                showOptionMenu(event.sender.id);
                break;
              case 'work':
                sendTextMessage(event.sender.id,'I am studying about IT(Software) in FIT of HCMUS HCM. And Fresher about Web Internship in GMO-Z.com RUNSYSTEM HCM.');
                showOptionMenu(event.sender.id);
                break;
              case 'status':
                sendTextMessage(event.sender.id,'I am a single. hihi. Freedom.');
                showOptionMenu(event.sender.id);
                break;
              case 'hobbits':
                sendTextMessage(event.sender.id,'I very like sports as football, badminton.. and learning Japanese and discovering about Japan');
                showOptionMenu(event.sender.id);
                break;
              case 'list':
                sendTextMessage(event.sender.id,'Enter your name:');
                state[event.sender.id] = 'input_name';
                break;
              default:
              //
            }
          }
        }
      })
    })
    
    res.sendStatus(200);
  } 
});

/*
processing message when we enter a message
@param{event}
*/
function processMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  // var timeOfMessage = event.timestamp;
  var message = event.message;
  
  console.log('Sender: %d - Recipient: %d - message:',senderID,recipientID,message);

  // var messageID = message.mid;
  var messageText = message.text;
  var attachments = message.attachments;
  
   if(messageText) {
    if(state[senderID]) {
      
      switch(state[senderID]) {
        case 'options_menu':
            switch(messageText) {
              case 'yes':
                sendFirstMenu(senderID);
                break;
              case 'no':
                sendTextMessage(senderID,'Thank you for visiting our chat');
                break;
              default:
              // sendTextMessage(senderID,'Have a good time!');
            }
          break;
        case 'input_name':
          sendTextMessage(senderID,'Thanks. Your name has been placed on the reservation list');
          state[senderID] = null;
          break;
        default:
        //
      }
    } else {
      
        switch(messageText) {
          case 'hi':
            sendTextMessage(senderID,'hi, how are you?');
            break;
          case 'ok':
            sendTextMessage(senderID,'OK. thanks. I am fine!');
            break;
          case 'name':
            sendTextMessage(senderID,'My name is Minh Quangg.');
            break;
          case 'age':
            sendTextMessage(senderID,'I am 21');
            break;
          case 'work':
            sendTextMessage(senderID,'I am studying about IT(Software) in FIT of HCMUS HCM. And Fresher about Web Internship in GMO-Z.com RUNSYSTEM HCM');
            break;
          case 'bye bye':
            sendTextMessage(senderID,'Thanks for using chatbot. See you again');
            break;
          default:
            sendTextMessage(senderID,'Have a good time!');
      }
    }
    
  } else if(attachments) {
    console.log('give me a attachments');
  }
  
}


function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id:recipientId
    },
    
    message: {
      text:messageText
    }
  };
  callSendAPI(messageData);
}


function sendFirstMenu(recipientId) {
  var messageData = {
    recipient: {
      id:recipientId
    },
    
    message: {
      attachment: {
        type:"template",
        payload: {
          template_type:"button",
          text:"About me",
          buttons:[
          {
            type:'postback',
            title:'Myself',
            payload:'name'
          }, 
          {
            type:'postback',
            title:'Work',
            payload:'work'
          }, 
          {
            type:'postback',
            title:'Status',
            payload:'status'
          }, 
          {
            type:'postback',
            title:'Hobbits',
            payload:'hobbits'
          }, 
          {
            type:'postback',
            title:'list',
            payload:'list'
          }
          
          ]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function showOptionMenu(recipientId) {
  setTimeout(function() {
    sendTextMessage((recipientId,'Can I help you with something else?'));
    state[recipientId] = 'options_menu';
  },3000);
  
}

function callSendAPI(messageData) {
  request({
    url:'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:'EAACQmyb1tZB4BAKHB6aluXJS5XcopT7OPpWJENpfxFZBT9QXbg3mGPAAjveTnzK1Pd1AGxg1ZAfo7fhqHYcElwPLVZBR0ZALOfZCXacrtm9YsgTPYOplj7MZAeyPxB9rxLwIpY8QPmbp0TpimEGOE6ZBteRaVdQBtvIQEFboCXSc9AZDZD'},
    method: 'POST',
    json:messageData
  }, function(error,response,body) {
    if(!error && response.statusCode == 200) {
      console.log('Message is send successfull');
      var recipientID = body.recipient_id;
      var messageID = body.message_id;
      
    } else {
      console.log('Fail when sending message');
      console.log(error);
    }
    
  });
  
}
















io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
