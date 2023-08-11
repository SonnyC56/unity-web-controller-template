import { WebSocketServer } from "ws";
import state from "../state.js";
import {broadcastQueuePositions} from "../helpers.js";
export const unitySocket = new WebSocketServer({ noServer: true });

unitySocket.on("connection", (unityClient) => {
  state.unityClient = unityClient;

  state.controlQueue.forEach((client, index) => {
    client.client.send(
      JSON.stringify({
        type: "unityConnected"
      })
    );
  });
  broadcastQueuePositions();
  console.log(
    "Unity client connected to server. Connected Clients: ",
    state.connectedClients?.length
  );

  unityClient.on("message", () => {
    console.log("UNITY CONNECTED :", unitySocket);
  });

  unityClient.on("close", () => {
    // If this was the Unity client, set it to null
    state.unityClient = null;
    console.log("UNITY DISCONNECTED");
  });

  unityClient.on("error", console.error);
});
