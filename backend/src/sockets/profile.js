import { WebSocketServer } from "ws";
import state from "../state.js";

export const profileSocket = new WebSocketServer({ noServer: true });

profileSocket.on("connection", (profileClient) => {
  console.log(
    "Profile client connected to server. Connected Clients: ",
    state.controlQueue.length
  );

  profileClient.on("error", console.error);

  profileClient.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("data: ", data);
    if (data.type === "setProfile") {
      profileClient.send(
        JSON.stringify({
          type: "redirect",
          url: `/controller/${data.profile.name}`,
        })
      );
    }
  });

  profileClient.on("close", () => {
    console.log("client disconnected");
  });

  profileClient.on("error", console.error);
});
