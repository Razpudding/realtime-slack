# Realtime Slack app
A realtime Slack app serving as an example of how to use socket connections to allow for realtime communication between your own server and a realtime API endpoint. This basic application serves as an educational tool. I've tried to use the minimal amount of npm packages because I want my code to be explicit and independent 

## Usage
You probably shouldn't install this app on a server right now as it will basically ask the first user for their slack credentials and then use that to steal all their messages and display them to anyone else using that instance of this app. unintended feature :speak_no_evil:

If you do want to run this application, download the files to a folder, run npm install, put your SLACK_CLIENT_ID en SLACK_CLIENT_SECRET in a .env file in the root of the folder and then run npm start in your terminal. The app should now be hosted at http://localhost:3100/ (you can change the port in the index.js file)

Features:
* Oauth grant flow allowing a user to connect this app to their Slack account (and read/write messages to their channels)
* Displays incoming message events in the browser
That's pretty much it...for now

Uses:
* Express
* Socket.io
* Promises
* Routing

Feature wishlist:
- [ ] Tree visualization of channel activity (branch per channel, leaf per message, each leaf has a countdown timer) [I want to use D3 for this feature]
- [ ] The server now abuses the credentials of the first user that connects and loads whatever data that user has access to -> bad. I guess each new client should trigger a new socket connection from my server to the slack RTM. Then each message that comes back from Slack would be coupled to the original user that allowed for that connection to be made.
- [ ] Remove the 'rp' and 'ws' dependencies, ideally they shouldn't be in an educational version of this app as they needlessly abstract basic functionalities
- [ ] Security (identify user making the request, only serve data to the right user, sanitize inputs)
- [ ] Map user IDs to usernames using Slack RTM's users.list method
- [x] Implement socket connection to Slack's Realtime API
- [x] Better routing
- [x] Write server key in .env
- [x] Store data server side [mongo?] (in the end I went with a simple JSON like object model stored server side)
- [x] Make this repo public so it can be used for educational purposes.