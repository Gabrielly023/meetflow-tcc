import { io } from "socket.io-client";
import { API_URL, TOKEN_KEY } from "./config";
export const socket = io(API_URL, {
  autoConnect: false,
  auth: (callback) => callback({ token: localStorage.getItem(TOKEN_KEY) }),
});