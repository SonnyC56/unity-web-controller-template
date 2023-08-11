import { createServer } from "http";
import { parse } from "url";
import { adminSocket } from "./sockets/admin.js";
import { unitySocket } from "./sockets/unity.js";
import { userSocket } from "./sockets/user.js";
import { profileSocket } from "./sockets/profile.js";

export const server = createServer();

server.on("upgrade", function upgrade(request, socket, head) {
  const { pathname } = parse(request.url);
  console.log(`Received upgrade request for ${pathname}`);

  if (pathname === "/api/user") {
    userSocket.handleUpgrade(request, socket, head, function done(ws) {
      userSocket.emit("connection", ws, request);
    });
  } else if (pathname === "/api/unity") {
    unitySocket.handleUpgrade(request, socket, head, function done(ws) {
      unitySocket.emit("connection", ws, request);
    });
  } else if (pathname === "/api/admin") {
    adminSocket.handleUpgrade(request, socket, head, function done(ws) {
      adminSocket.emit("connection", ws, request);
    });
  } else if (pathname === "/api/profile") {
    profileSocket.handleUpgrade(request, socket, head, function done(ws) {
      profileSocket.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});
