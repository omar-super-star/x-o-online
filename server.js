const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var waitingplayer=[];
var roomcodearray=[];
var roomplayers={}
//var number=0;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/x-o1.html');
});

app.get('/start', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

function checkuser(code){
  if (code in player){
    return false;
  }
  return true;
}

io.on('connection', (socket) => {
  var usercode=socket;

  
  if (waitingplayer.length===0){
    waitingplayer.push(usercode)
  
  }else{
    var usercode2=waitingplayer.pop();
    var roomcode=`${usercode.id}`+`${usercode2.id}`;
    roomcodearray.push(roomcode);
    usercode.join( roomcode);
    usercode2.join( roomcode);
    roomplayers[usercode.id]={playernum:0,
      roomcode:roomcode,
      socket:usercode
}
roomplayers[usercode2.id]={playernum:1,
  roomcode:roomcode,
  socket:usercode2
}
    

    io.to(usercode.id).emit("getplayerdetail",
    {num:0,
      room:roomcode});
    io.to(usercode2.id).emit("getplayerdetail",
    {num:1,
      room:roomcode}
      );
  }

  socket.on("newgame",(data)=>{
    io.in(roomplayers[socket.id].roomcode).emit("recivenewgame",data.pos);
  })
  socket.on("wantretry",(data)=>{
    socket.broadcast.to(roomplayers[socket.id].roomcode).emit("wantretry");
  })
  socket.on("retry",(data)=>{
    console.log(data)
    io.in(roomplayers[socket.id].roomcode).emit("retry",data);
  })

  socket.on('disconnect', function () {
    console.log("disconnect")
    if(roomplayers[socket.id] != undefined){
    io.in(roomplayers[socket.id].roomcode).emit("disconnection");
    }
    });
  


});



server.listen(3000, () => {
  console.log('listening on *:3000');
});
