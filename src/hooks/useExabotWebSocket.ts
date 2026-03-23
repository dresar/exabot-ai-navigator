import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/auth";
import { getWsBase } from "@/lib/api";

export type WsChannel = "predictions" | "market" | "notifications";

/**
 * Connects to FastAPI `/ws/{channel}?token=...` and calls `onMessage` for each server push.
 * Use with `useCallback` + `queryClient.invalidateQueries` for real-time refresh.
 */
export function useExabotWebSocketChannel(channel: WsChannel, onMessage: () => void) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const base = getWsBase();
    const url = `${base}/ws/${channel}?token=${encodeURIComponent(token)}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }

    ws.onmessage = () => {
      cbRef.current();
    };

    return () => {
      ws.close();
    };
  }, [channel]);
}
