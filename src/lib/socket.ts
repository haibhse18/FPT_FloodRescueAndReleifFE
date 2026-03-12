import { io, Socket } from "socket.io-client";

/**
 * Socket.IO Connection Manager
 *
 * Quản lý kết nối WebSocket tới BE server.
 * Token truyền qua `auth` object (không phải query string) để bảo mật hơn.
 */

// Strip "/api" suffix from NEXT_PUBLIC_API_URL since Socket.IO connects to root
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

/**
 * Khởi tạo kết nối WebSocket với JWT token
 */
export function connectSocket(token: string): Socket {
  // Ngắt kết nối cũ nếu có
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

/**
 * Lấy socket instance hiện tại
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Ngắt kết nối WebSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
