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

  const [socket, setSocket] = useState(null);
  // console.log("socket=====", socket);

  const socketRef = useRef(null);
  const initializeSocket = () => {
    if (!token) return;
    const newSocket = io("https://www.fitness.tacosdecrema.com", {
      auth: { token: token },
      reconnectionAttempts: 15,
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
      console.log("Connected to socket server");
      // Re-authenticate if needed
      setSocket(newSocket);

    });
    // newSocket.on("authenticated", (id) => {
    //   console.log("newSocket=====-=-==-", id);
    //   setSocket(newSocket);
    // });
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
      initializeSocket();
      console.log("===============Socket Initialize");
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
