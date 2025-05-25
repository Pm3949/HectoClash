import { io } from "socket.io-client";

const socket = io("https://hectoclash-backend.onrender.com", {
  withCredentials: true,
  autoConnect:true,
});

export default socket;
