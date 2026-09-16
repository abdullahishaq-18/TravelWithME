import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, { autoConnect: false });
