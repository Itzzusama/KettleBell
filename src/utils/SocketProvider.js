import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token } = useSelector((state) => state.authConfigs);
  const dispatch = useDispatch();

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    if (!token || socketRef.current?.connected) return;

    console.log("🔌 Connecting to socket server...");

    const newSocket = io("https://www.fitness.tacosdecrema.com", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    // ===== Event Bindings =====
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      newSocket.emit("authenticate", token);
    });

    newSocket.on("authenticated", () => {
      console.log("🔐 Socket authenticated");
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error?.message || error);
      setIsConnected(false);
    });

    newSocket.on("unauthorized", (error) => {
      console.error("🚫 Unauthorized socket connection:", error?.message);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`♻️ Reconnected after ${attemptNumber} attempts`);
      newSocket.emit("authenticate", token);
    });

    newSocket.on("unread-conversation-counts", (count) => {
      console.log("📩 Unread conversation counts:", count);
      // dispatch(setChatCount(count?.unreadCount));
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setIsConnected(false);
      setSocket(null);
      // Try reconnect with delay
      setTimeout(() => {
        console.log("🔄 Attempting to reconnect socket...");
        connectSocket();
      }, 3000);
    });

    socketRef.current = newSocket;
  }, [token]);

  const disconnectSocket = useCallback(() => {
    console.log("🔌 Disconnecting socket...");
    socketRef.current?.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  // Helper to emit events safely
  const send = useCallback((event, data, callback) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data, callback);
    } else {
      console.warn(`⚠️ Cannot send event "${event}", socket not connected`);
    }
  }, []);

  useEffect(() => {
    if (token) {
      connectSocket();
    } else {
      console.log("⚠️ No token found, not connecting to socket");
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [token, connectSocket, disconnectSocket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        send,
        isConnected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
