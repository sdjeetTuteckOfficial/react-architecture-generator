import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/ChatSlice";

const useWebSocket = (url) => {
  const ws = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dispatch(
        addMessage({
          text: data.text,
          isBot: true,
          subtitle: data.subtitle || "",
        })
      );
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, [url, dispatch]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};

export default useWebSocket;
