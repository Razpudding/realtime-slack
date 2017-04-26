var WebSocket = require('ws');
var treeData = {};

//Function that sets up the websocket connection, TODO: refactor this
exports.connectRealtime = function(app, realtimeEndpoint){
	console.log("connecting to the realtime endpoint ( ͡° ͜ʖ ͡°) " + realtimeEndpoint);
	console.log(app);
	ws = new WebSocket(realtimeEndpoint);

	ws.on('open', function open() {
		//for some reason, sending the following message to the socket server will trigger a connection close
		//Probably because this type of message is not accepted by the Slack server (not the right format)
	  	// ws.send('something', function(err){
	  	// 	console.log(err || "send was successful");
	  	// });
	  	console.log("connection to socket server opened");
	  });	
	//Note that this "message" event indicates the websocket gets a message, it's not related to the type of event Slack sends
	ws.on('message', function incoming(data) {
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
			app.io.sockets.emit('update_tree_data', treeData[data.ts]);
		}
		else if (data.type == "user_typing"){
			console.log("--- User typing");
			app.io.sockets.emit('user_typing', data.user, data.channel);
		}
	});
	//On connection close attempt reconnection
	//TODO: add a counter, break so this doesn't get stuck in a recursive loop. Also a timer so reconnection attepts will be triggered every couple minutes or so
	// Reconnection attempt counter should decrease over time because the server can be uo for an arbitrary amount of time
	ws.on('close', function close() {
		console.log('disconnected');
		connectRealtime(realtimeEndpoint);
	});
};

//module.exports = connectRealtime;