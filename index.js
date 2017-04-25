/* jslint console:true, devel:true, eqeq:true, plusplus:true, sloppy:true, vars: true, white:true, esversion:5 */

//Separate your requires from your initialization so as to not get confused about order of execution
//The order of requires doesn't matter
var dotenv = require('dotenv');
var express = require('express');
var WebSocket = require('ws');
var http = require('http');
var debugHttp = require('debug-http');	
var rp = require('request-promise');//A promise wrapper for the HTTP request module
var socketio = require('socket.io');
var router = require("./router");

//Set up environment vars
dotenv.config();
//Set up http debugging
debugHttp();

//Set up an express and socketio server
//The order of initializations DOES matter. Think about what needs to be initialized first
//Which packages depend on instances of other packages? Which configurations are most crucial?
var app = express();
var server = http.Server(app);
var io = socketio(server);
//Configure the express app to use the router file
app.use('/', router);
//Set the port the app will run on
var port = 3100;
//A simple data structure keeping track of all our messages. This is essentially a database with the timestamp of each message being the primary key
var treeData = {};

console.log("Raising Server from the dead");

//Function that sets up the websocket connection, TODO: refactor this
app.connectRealtime = function(){
	console.log("connecting to the realtime endpoint ( ͡° ͜ʖ ͡°) " + app.realtimeEndpoint);
	app.ws = new WebSocket(app.realtimeEndpoint);

	app.ws.on('open', function open() {
		//for some reason, sending the following message to the socket server will trigger a connection close
		//Probably because this type of message is not accepted by the Slack server (not the right format)
	  	// app.ws.send('something', function(err){
	  	// 	console.log(err || "send was successful");
	  	// });
	  	console.log("connection to socket server opened");
	  });	
	//Note that this "message" event indicates the websocket gets a message, it's not related to the type of event Slack sends
	app.ws.on('message', function incoming(data) {
		console.log("message received from socket server: ");
		data = JSON.parse(data);

		console.log(data.type);
		if (data.type == "message"){
			treeData[data.ts] = {
				'user' : data.user,
				'text' : data.text,
				'channel': data.channel
			};
			//Simple way to send messages to the client
			//io.sockets.emit('message', data.user, data.text, data.channel);	
			//More complete/complex way
			io.sockets.emit('update_tree_data', treeData[data.ts]);
		}
		else if (data.type == "user_typing"){
			console.log("--- User typing");
			io.sockets.emit('user_typing', data.user, data.channel);
		}
	});
	//On connection close attempt reconnection
	//TODO: add a counter, break so this doesn't get stuck in a recursive loop. Also a timer so reconnection attepts will be triggered every couple minutes or so
	// Reconnection attempt counter should decrease over time because the server can be uo for an arbitrary amount of time
	app.ws.on('close', function close() {
		console.log('disconnected');
		app.connectRealtime();
	});
};

//socket.io testcode
io.on('connection', function (socket) {
  console.log("new client connection");
  socket.emit('initial_tree_data', treeData);	//Send the new client (and only that client) a the current tree data model

});

server.listen(3100, function(err){
	console.log(err || "Hi this is express, and I'm node, and you're listening to clean-node on " + port);	
});