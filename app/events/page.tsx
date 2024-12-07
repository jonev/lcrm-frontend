"use client";

import { useEffect, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EventsHub() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [aggregateId, setAggregateId] = useState<string>(
    "3fa85f64-5717-4562-b3fc-2c963f66af21"
  );

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    return () => {
      if (connection) {
        connection.off("SubscribeToAggregate");
      }
    };
  }, []);

  function listen() {
    const connect = new HubConnectionBuilder()
      .withUrl("http://localhost:5237/event-hub")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    setConnection(connect);
    connect
      .start()
      .then(() => {
        connect.on("PublishEvent", (aggregateId, event, eventType) => {
          setEvents((p) => [...p, { aggregateId, event, eventType }]);
          console.log(aggregateId);
        });
        connect.invoke("SubscribeToAggregate", aggregateId);
      })

      .catch((err) =>
        console.error("Error while connecting to SignalR Hub:", err)
      );
  }

  return (
    <>
      <p>Events hub</p>
      <Input
        defaultValue="3fa85f64-5717-4562-b3fc-2c963f66af21"
        onChange={(e) => setAggregateId(e.target.value)}
      />
      <Button onClick={listen}>Listen</Button>
      <div>
        {events.map((e) => (
          <div key={e.aggregateId}>
            <p>{e.aggregateId}</p>
          </div>
        ))}
      </div>
    </>
  );
}
