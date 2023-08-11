import { WebSocketServer } from "ws";
import state from "../state.js";
import { v4 as uuidv4 } from "uuid";
import {
  removeOneInPlace,
  broadcastQueuePositions,
  serializeClientArray,
} from "../helpers.js";

export const adminSocket = new WebSocketServer({ noServer: true });

adminSocket.on("connection", (adminClient) => {
  state.adminClients.push({
    client: adminClient,
    name: "admin",
    uuid: uuidv4(),
  });

  console.log(
    "admin connected to server. Connected Admins: ",
    state.adminClients.length
  );

  adminClient.on("error", console.error);

  adminClient.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "kickMember") {
      const uuidToKick = data.member.uuid;
      console.log("Kicking member from control queue: ", uuidToKick);
      const memberToKick = state.controlQueue.find(
        (i) => i.uuid === data.member.uuid
      );
      const isKicked = removeOneInPlace(
        state.controlQueue,
        (member) => member === memberToKick
      );

      if (isKicked) {
        console.log(
          `Member ${memberToKick.name} has been kicked from the control queue`
        );

        if (state.controlQueue.length) {
          memberToKick.client.send(JSON.stringify({ type: "done" }));
        }

        if (state.controlQueue.length) {
          state.controlQueue[0].client.send(
            JSON.stringify({ type: "control" })
          );
        }

        // Notify all clients of the updated control queue
        broadcastQueuePositions();
      } else {
        console.log(`Member ${data.member.uuid} not found in control queue`);
      }
    } else if (data.type === "timer") {
      console.log("Setting turn timer to: ", data.time);
      state.turnTimerInMilluSeconds = data.time;
      adminClient.send(
        JSON.stringify({
          type: "timer",
          time: state.turnTimerInMilluSeconds,
        })
      );
    } else if (data.type === "admin") {
      adminClient.send(
        JSON.stringify({
          type: "controlQueue",
          queue: serializeClientArray(state.controlQueue),
        })
      );
      adminClient.send(
        JSON.stringify({
          type: "timer",
          time: state.turnTimerInMilluSeconds,
        })
      );
      console.log("ADMIN CONNECTED :");
    }
  });

  adminClient.on("close", () => {
    removeOneInPlace(state.adminClients, (c) => c === adminClient);
    console.log("client disconnected");
  });

  adminClient.on("error", console.error);
});
