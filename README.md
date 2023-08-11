# Web Client to Control Unity App over Websocket
This is a node.js WebSocket Server backend with both a web-based react client and a Unity-based C# client. It enables a user to control both the look (rotation) and movement (translation) of the Unity First Person Controller Template Player Capsule. The backend server listens for a connection from a Unity client, and once it has one it is ready to allow users on the web client to send over data to the Unity client. When a user hits the URL or IP address of the server hosting both the backend and frontend react files, the user is presented with the option to enter their name to control the Unity App or to enter a queue if someone is already in control. There is a queueing system built into this repo, as well as a customizable turn timer, and is flexible enough to adapt to your own needs. 

## Creating your own version of this project
This repo can be cloned and used for another project as long as you host it yourself. 

In order to get this working, you are going to have to have your own web server for the backend web socket to be hosted on.

I used a Digital Ocean Ubuntu droplet configured with node.js and Nginx as a reverse proxy. You can learn how to do this here - https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-20-04

Once you have a droplet, clone this repo onto it in the root folder. Configure PM2 to run main.js in the backend directory on start-up. 
You will then need to build the frontend part of the app using npm run build -- but before we do this we need to update the IP address in the code.

Open your cloned repo and replace all instances of IP-ADDRESS (There is a case of it in Admin.js, Controller.js, and Profile.js) with the reserved IP from your own digital ocean droplet. 
Once this is done you can pull the updates on the droplet and npm run build the frontend directory of the application.

You will then need to make sure your Nginx config is correct. 
This is what mine looks like - it is in this directory - /etc/nginx/sites-available/

    server {
      listen 80;
      server_name IP-ADDRESS;  # Replace with your domain or IP address
    
      root /root/unity-web-controller/frontend/build;
      index index.html;

      location /api/ {
        proxy_pass http://localhost:8090;  # Assuming your backend is running on localhost:3000
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
      }

      location / {
        try_files $uri $uri/ /index.html;
      }
    }

Once this is configured correctly, restart nginx and restart your droplet. When it restarts, PM2 should start running main.js (the backend server) and nginx will be set up to deliver the frontend build folder at the droplets IP Address while routing traffic to IPAddress/api to the backend at port 8090. This allows our app to function. You can now go to the IP Address and you should be prompted with a page to sign up for the queue to control the Unity App.

# Creating a new Unity Client
Download the Unity template project [here](https://drive.google.com/drive/folders/1iXt_OE-VkC8c1LNEu5RuxSQRRvn_JnpD?usp=drive_link).
This project is set up with the necessary dependencies to connect to a WebSocket and has the scripts pre-applied and game objects needed to be added to Unity. 

You will need to replace IP-ADDRESS (it is in there 3 times) in the unity-client.cs/WebsocketClient.cs script in this repo with the IP address of your web server.

The script is named WebsocketClient.cs in Unity and it is named unity-client.cs in this git repo. Make the change first in the git repo in a code editor of your choice. Commit this to git, then copy the entire script. Open your newly downloaded Unity project, double-click on the WebsocketClient.cs script inside of the scripts folder, and replace this entire script with the one you just copied. Or just make the same changes here as you did for the git repo, it doesn't matter. Just make sure you have the correct IP address in the script inside of the Unity project.

This script handles the connection with the WebSocket at the start of the Unity App and it also listens for incoming data from the web client in control. It moves/rotates the default player capsule as well as changes the values and visibilities of canvas elements in the project. For instance, it changes the position and scale of the QR code, displays the name of the user in control, and displays the amount of time left in your turn. It also manages what camera is the active camera depending on whether anyone is in control. When no one is in control, it respawns the user to the location of the SpawnPoint empty game object, resets the timer, changes the active camera to the placeholder camera, and changes to a larger QR code. The QR code is dynamically generated based on the IP Address entered into the WebsocketClient script. 

Now all you have to do is replace the 3d assets and game logic. You can also edit the keyframes of the secondary camera animation.

If you are curious about how the unity scripts work, you can find them in this repo and make edits to them as you need. 

## Adding functionality between the unity client and web client
This project is a WebSocket sending information from one client to another. The unity client and the web client controlling it are these two parties. 
There are messages being sent over the WebSocket to the unity client controlling the player movement, but other data types than movement or rotation can easily be added. 

For instance, if you wanted a button data type, a JSON object like this {type: 'button', title: 'button-text'. buttonId: 'string'} could be sent from the unity client when hitting a trigger inside the game. 
The web client can respond to this and add this button to the user's screen. Once the user clicks the button, the web client could send a corresponding JSON object back to Unity telling it that an action was taken by the user 
and to do the next logical step in the Unity game/experience. The possibilities here are pretty endless. Imagine a user walking up to a candle in the Unity scene and being prompted to blow into their phone's microphone to blow out the candle, or use the accelerometer to make someone pretend to dribble and shoot a basketball.


# NPM scripts for development

##  In the /frontend project directory, you can run:
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## In the /backend project directory, you can run:

### `npm start`

this runs --- node src/main.js, starting the backend websocket server

