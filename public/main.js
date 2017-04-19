/* jslint browser:true, devel:true, eqeq:true, plusplus:true, sloppy:true, vars: true, white:true, esversion:5 */

console.log("Client-side is best side");
var socket = io();
var treeModel = {};

//listen to actual messages
socket.on('message', function (user, message, channel) {
	console.log("received data: " + arguments);
	document.body.insertAdjacentHTML("beforeend", "<p>"+ user + ": " + message + " (" + channel + ")" +"</p>");
});

//listen to user_typing event
socket.on('user_typing', function (user, channel) {
	console.log("received user_typing: " + arguments);
	//document.body.insertAdjacentHTML("beforeend", "<p>"+ data +"</p>");
});

//listen to the initial data for our message tree
socket.on('initial_tree_data', function(data){
  console.log("Receiving initial tree data");
  treeModel = data;
  renderTree();
});

//listen to updates of our tree data
socket.on('update_tree_data', function(data){
  console.log("Receiving update to tree data");
  console.log(data);
  treeModel[data.ts] = data;
  renderTree();
});

function renderTree(){
	console.log("rendering treemodel");
	console.log(treeModel);
}