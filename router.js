var express = require('express');
var router = express.Router();
var rp = require('request-promise'); //A promise wrapper for the HTTP request module

module.exports = router;

// Listening to requests at the root of the web app
router.get('/', function(request, response){

	//It's necessary to encode the permissions string to allow for scopes like channels:read
	var permissions = encodeURIComponent('client');
	console.log("serving Slack button with permissions: " + permissions);
	// Here we need request.app to access Express instance called 'app' we created in our main server file
	if (request.app.accessToken){
		console.log("already have oauth, reroute client to /main");
		//TODO: actually serve /main to the client. I guess I need next() for this
	}
	else {
		response.send('<p>Please click the button below to allow this app to access your Slack account</p><a href="https://slack.com/oauth/authorize?scope='+ permissions +'&client_id=' +process.env.SLACK_CLIENT_ID + '"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
	}
});

router.get('/oauth', function (request, response){
	console.log(request.query.code);
	rp({													
		uri: 'https://slack.com/api/oauth.access',
		qs: {
			client_id: process.env.SLACK_CLIENT_ID,
			client_secret: process.env.SLACK_CLIENT_SECRET,
			code: request.query.code,
			redirect_uri : 'https://localhost:3100/oauth'
		}
	})
	.then( function (data){
		data = JSON.parse(data);
		console.log(data)
		request.app.accessToken = data.access_token;
		//console.log(app.accessToken);
		response.send('<p>Authorization complete! Click <a href = "/main">here </a> to return to the main page</p>');
	});
});

//When client routes to main, a call is made to the Slack realtime api, the ws address response is then used to create a socket connection
router.get('/main', function(request, response, next){
	if (request.app.accessToken){
		rp({
			uri: 'https://slack.com/api/rtm.start',
			qs: {
				token: request.app.accessToken			
			}
		})
		.then( function (data){
			data = JSON.parse(data);
			//console.log(data.url);
			request.app.realtimeEndpoint = data.url;
			request.app.connectRealtime();
			next();
		});
	}
	else {
		//route user to "/"
	}
});
//In adition to the server side actions, the following static files are served to the client @/main
//the next() in router.get('/main') looks for any other routes matching the '/main' pattern. In this case, finding the static middleware function below
router.use('/main', express.static(__dirname + '/public'));