/* jslint console:true, devel:true, eqeq:true, plusplus:true, sloppy:true, vars: true, white:true, esversion:5 */

//Separate your requires from your initialization so as to not get confused about order of execution
//The order of requires doesn't matter
var dotenv = require('dotenv');
var express = require('express');
var http = require('http');
var debugHttp = require('debug-http');	
var rp = require('request-promise');//A promise wrapper for the HTTP request module
var socketio = require('socket.io');
var router = require("./router");
var socketHandler = require('./socketHandler.js');

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

console.log("Raising Server from the dead");

//On socket connection from a client, send them the treeData thusfar generated
io.on('connection', function (socket) {
  console.log("new client connection");
  socket.emit('initial_tree_data', socketHandler.treeData);	//Send the new client (and only that client) a the current tree data model

});

server.listen(3100, function(err){
	console.log(err || "Hi this is express, and I'm node, and you're listening to realtime-slack on " + port);	
});