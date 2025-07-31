import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });
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
      console.error("Socket connection error:", error);
    });
    newSocket.on("unauthorized", (error) => {
      console.error("Unauthorized socket connection:", error.message);
    });
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      // Re-authenticate after reconnection
      newSocket.emit("authenticate", token);
    });
    
    newSocket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setSocket(null);
      setTimeout(() => {
        console.log("Reconnecting socket...");
        initializeSocket();
      }, 3000); // 3-second delay before reconnecting
    });
    socketRef.current = newSocket;
  };
  useEffect(() => {
    if (token) {
      initializeSocket();
      console.log("===============Socket Initialize");
    } else {
      console.log("No Token found for authentication");
    }
    // Clean up on unmount or app kill
    return () => {
      // console.log("Disconnecting socket...");
      socketRef.current?.disconnect();
      setSocket(null);
    };
  }, [token]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
