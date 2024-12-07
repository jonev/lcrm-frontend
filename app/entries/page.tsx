"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { headers } from "next/headers";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";

export default function EntriesHub() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [entryName, setEntryName] = useState<string | null>(null);

  const [ready, setReady] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [success, setSuccess] = useState<any[]>([]);
  const [rejected, setRejected] = useState<any[]>([]);

  useEffect(() => {
    listen();
    return () => {
      if (connection) {
        connection.off("SubscribeToEntries");
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
        connect.on("PublishEntry", (aggregateId, entry) => {
          switch (entry.status) {
            case 0:
              setReady((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
                { aggregateId, entry },
              ]);
              setActive((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setSuccess((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setRejected((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              break;
            case 1:
              setReady((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setActive((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
                { aggregateId, entry },
              ]);
              setSuccess((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setRejected((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              break;
            case 2:
              setActive((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setReady((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setSuccess((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
                { aggregateId, entry },
              ]);
              setRejected((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              break;
            case 3:
              setReady((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setActive((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setSuccess((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
              ]);
              setRejected((p) => [
                ...p.filter((e) => e.aggregateId !== aggregateId),
                { aggregateId, entry },
              ]);

              break;
          }
          console.log(aggregateId);
        });
        connect.invoke("SubscribeToEntries");
      })

      .catch((err) =>
        console.error("Error while connecting to SignalR Hub:", err)
      );
  }

  return (
    <main className="grid grid-cols-4 gap-3">
      <p className="col-start-1 col-span3">Entries hub</p>
      <Input
        type="text"
        placeholder="Name"
        value={entryName!}
        onChange={(e) => setEntryName(e.target.value)}
      />
      <Button
        disabled={!entryName || entryName.length < 2}
        onClick={async () =>
          fetch(
            process.env.NEXT_PUBLIC_API_HOST + "/api/command/entries/create",
            {
              method: "POST",
              body: JSON.stringify({
                id: uuidv4(),
                name: entryName,
              }),
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
              },
            }
          )
        }
      >
        Create
      </Button>
      <div className="col-start-1 col-span-1">
        <EntryColumn>
          <p className="h2 text-center">Ready</p>
          {ready.map((e) => (
            <EntryCard
              key={e.aggregateId}
              aggregateId={e.aggregateId}
              entry={e.entry}
            />
          ))}
        </EntryColumn>
      </div>
      <div className="col-start-2 col-span-1">
        <EntryColumn>
          <p className="h2 text-center">Active</p>
          {active.map((e) => (
            <EntryCard
              key={e.aggregateId}
              aggregateId={e.aggregateId}
              entry={e.entry}
            />
          ))}
        </EntryColumn>
      </div>
      <div className="col-start-3 col-span-1">
        <EntryColumn>
          <p className="h2 text-center">Success</p>
          {success.map((e) => (
            <EntryCard
              key={e.aggregateId}
              aggregateId={e.aggregateId}
              entry={e.entry}
            />
          ))}
        </EntryColumn>
      </div>
      <div className="col-start-4 col-span-1">
        <EntryColumn>
          <p className="h2 text-center">Rejected</p>
          {rejected.map((e) => (
            <EntryCard
              key={e.aggregateId}
              aggregateId={e.aggregateId}
              entry={e.entry}
            />
          ))}
        </EntryColumn>
      </div>
    </main>
  );
}

function EntryColumn({ children }: { children: ReactNode }) {
  return <div className="bg-gray-100 rounded-md border-2 p-4">{children}</div>;
}

function EntryCard({
  aggregateId,
  entry,
}: {
  aggregateId: string;
  entry: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{entry.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {entryStatuses[entry.status].statusText}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {entryStatuses.map(({ statusNumber, statusText }) => (
              <DropdownMenuCheckboxItem
                key={statusNumber}
                checked={entry.status === statusNumber}
                onCheckedChange={async () =>
                  fetch(
                    process.env.NEXT_PUBLIC_API_HOST +
                      "/api/command/entries/change-status",
                    {
                      method: "POST",
                      body: JSON.stringify({
                        id: aggregateId,
                        status: statusNumber,
                      }),
                      headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                      },
                    }
                  )
                }
              >
                {statusText}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

const entryStatuses: { statusNumber: number; statusText: string }[] = [
  { statusNumber: 0, statusText: "Ready" },
  { statusNumber: 1, statusText: "Active" },
  { statusNumber: 2, statusText: "Success" },
  { statusNumber: 3, statusText: "Rejected" },
];
