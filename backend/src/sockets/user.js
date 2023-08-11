import { WebSocketServer } from "ws";
import state from "../state.js";
import { v4 as uuidv4 } from "uuid";
import { removeOneInPlace, broadcastQueuePositions } from "../helpers.js";

export const userSocket = new WebSocketServer({ noServer: true });

userSocket.on("connection", (userClient) => {
  const uuid = uuidv4();
  let done = false;
  console.log(
    "user client connected to server. Connected User Clients: ",
    state.controlQueue.length
  );

  userClient.on("message", (data) => {
    data = JSON.parse(data);

    if (data.type === "done") {
      done = true;
      // The current client is done controlling the camera
      state.controlQueue.shift();
      // Allow the next client in line to take control
      if (state.controlQueue.length) {
        state.controlQueue[0].client.send(
          JSON.stringify({
            type: "control",
            turnTime: state.turnTimerInMilluSeconds,
          })
        );
        if(state.unityClient !== null){
          state.unityClient.send(JSON.stringify({type: "newUser", name: state.controlQueue[0].name}))
         }
      } else {
        // If there are no clients in the queue, notify the unity client
        if(state.unityClient !== null){
         state.unityClient.send(JSON.stringify({type: "noUsers"}))
        }
      }
      broadcastQueuePositions();
    } else if (data.type === "join") {
      // Add the new client to the end of the control queue
      state.controlQueue.push({
        client: userClient,
        name: data.name,
        uuid: uuid,
      });

      if(state.unityClient === null || state.unityClient === undefined){
        // If there is no unity client, notify the user that they are waiting on unity
        userClient.send(
            JSON.stringify({
              type: "waitingOnUnity"
            })
          );
      } else if (state.controlQueue.length === 1){
        // If this is the only client in the queue, grant control
        state.controlQueue[0].client.send(
          JSON.stringify({
            type: "control",
            turnTime: state.turnTimerInMilluSeconds,
          })
        );
        if(state.unityClient !== null){
          state.unityClient.send(JSON.stringify({type: "newUser", name: data.name}))
         }
    }
      // Notify all clients of their new position in the control queue
      broadcastQueuePositions();

    } else if (state.unityClient !== null) {
      state.unityClient.send(JSON.stringify(data));
      console.log("sending data to unity: ", data);
    }
  });

  userClient.on("close", () => {
    if(done) {return};
    console.log("client disconnected");

    let shouldGrantControl = false;
    if(state.controlQueue[0].client === userClient){
      shouldGrantControl = true;
    }

    // Remove the disconnected client from the connected clients list and control queue\
    removeOneInPlace(state.controlQueue, (c) => c.uuid === uuid);

    // Assign control to the first user in the queue
    if (state.controlQueue.length && shouldGrantControl) {
      state.controlQueue[0].client.send(
        JSON.stringify({
          type: "control",
          turnTime: state.turnTimerInMilluSeconds,
        })
      );
      if(state.unityClient !== null){
        state.unityClient.send(JSON.stringify({type: "newUser", name: state.controlQueue[0].name}))
       }
    } else if (state.controlQueue.length === 0) {
      // If there are no clients in the queue, notify the unity client
      if(state.unityClient !== null){
        state.unityClient.send(JSON.stringify({type: "noUsers"}))
       }
    }

    // Notify all clients of their new position in the control queue
    broadcastQueuePositions();
  });

  userClient.on("error", console.error);
});
