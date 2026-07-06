import { useState, useEffect, useRef } from 'react';

export function useLiveStreaming(connectionId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!connectionId) return;

    // In a real app, this would be the actual WS URL
    // const ws = new WebSocket(`wss://api.quantedge.io/live/${connectionId}`);
    // socketRef.current = ws;

    // Simulate WS connection
    setIsConnected(true);

    const interval = setInterval(() => {
      setLastMessage({
        type: 'PRICE_UPDATE',
        symbol: 'EURUSD',
        bid: 1.0850 + (Math.random() * 0.001),
        ask: 1.0852 + (Math.random() * 0.001),
        timestamp: new Date().toISOString()
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectionId]);

  return { isConnected, lastMessage };
}
