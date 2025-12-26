# Baileys + Prisma ORM 🚀🚀🚀

Gerencie sessões do WhatsApp com Baileys usando Prisma ORM e PostgreSQL.  
Manage WhatsApp sessions with Baileys using Prisma ORM and PostgreSQL.

**Maintained and developed by Marcelo BRBX.**  
This is my first official NPM package, designed to simplify WhatsApp Baileys integrations for the community.

A high-level, **Clean Architecture–based wrapper** for the Baileys library.  
This project simplifies WhatsApp integration by handling **session management**, **connection states**, and **automatic reconnections** internally.

---

## ✨ Key Features

- **Clean Architecture & SOLID**  
  Logic separated into Domain, Application, and Infrastructure layers for high maintainability.

- **Persistent Sessions (Prisma ORM)**  
  Authentication state is safely stored in your database.

- **Automatic Reconnection**  
  Handles network issues and the _Restart Required (515)_ error internally without crashing the process.

- **Easy Authentication**  
  Supports both **QR Code** and **Pairing Code (Phone Number)** methods.

- **Event-Driven**  
  Simple callbacks for success, failure, and authentication requirements.

- **Developer Friendly**  
  Complex Baileys socket logic is hidden behind a clean Facade.

---

## License

MIT

🛠️ Tech Stack

- Runtime: Node.js / TypeScript

- WA Library: baileys

- Database: Prisma ORM

- Logging: Pino

**--------------------------------------------------------**

## ⚠️ Prisma Schema (REQUIRED)

> **This library will NOT work without the following Prisma model.**

You **MUST** add this model to your `schema.prisma`:

```prisma
model Session {
  pkId      BigInt @id @default(autoincrement())
  sessionId String
  id        String
  data      String @db.Text

  @@unique([sessionId, id], map: "unique_id_per_session_id_session")
  @@index([sessionId])
}
```

📋 Prerequisites (Pre-configuration)
Before installing and using npm install baileys-prisma, you must ensure your environment is ready.

Database & Prisma Setup

**--------------------------------------------------------**

🚀 Getting Started Production

1. Installation
   npm install baileys-prisma

2. Basic Usage
   You don't need to manage sockets or handle complex reconnection logic. Simply instantiate the library and start.

**Observation**

- A unique ID(sessionId) to associate this connection with a specific user in your system.

```
prisma-client.ts example, create your instance prisma, you need just add Prisma Schema (REQUIRED) in the schema.prisma file.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

```

```
import { BaileysPrisma } from "baileys-prisma";
import type { WhatsappInterface } from "baileys-prisma";
import { prisma } from "./prisma-client";

const sessionId = "default";
const phoneNumber = "5521999999999";
const browserName = "Chrome";

const baileys = new BaileysPrisma(sessionId, browserName);

const config: WhatsappInterface = {
  basic: {
    sessionId,
    phoneNumber,
    isPairCode: true,
    timeReconnect: 3,
    log: "silent",
  },
  advanced: {
    onAuthRequired: async (code) => {
      console.log("onAuthRequired", code);
    },
    onFail: async (err) => {
      console.log("onFail", err);
    },
    onFatalFail: async (err) => {
      console.log("onFatalFail", err);
    },
    onSuccess: async () => {
      console.log("onSuccess");
    },
    onRestartRequired: async () => {
      console.log("onRestartRequired");
    },
  },
  prisma,
};

await baileys.start(config);

const phoneExample = "5521999999998";

setInterval(() => {
  if (baileys.baileysPrisma.isConnected()) {
    baileys.baileysPrisma.sendMessage(phoneExample, {
      text: "Hello, World!",
    });
  }
}, 30000);


```

🔒 Session Logs Interception (Optional)

This library provides a fine-grained log interception system that allows you to handle specific Baileys session events via dedicated callbacks.

If you don't provide these callbacks, the logs will still print normally to the console.

Example: Using Specific Session Callbacks

```
import { interceptSessionLogs } from "baileys-prisma";

interceptSessionLogs({
  ClosingSession: () => console.log("🔐 Renovação de chaves de sessão"),
  OpeningSession: () => console.log("🟢 Sessão criptográfica aberta"),
  RemovingOldClosedSession: () => console.log("🧹 Limpando sessões criptográficas antigas"),
  MigratingSessionTo: (code) => console.log("🔄 Migrando estrutura de sessão:", code),
  SessionAlreadyClosed: () => console.log("⚠️ Sessão já estava encerrada"),
  SessionAlreadyOpen: () => console.log("⚠️ Sessão já estava aberta"),
  SessionStorageMigrationError: () =>
    console.log("❌ Erro ao migrar armazenamento de sessão criptográfica"),
});
```

Available Callbacks

Event Description
ClosingSession Triggered when the session is being closed.
OpeningSession Triggered when the session is being opened.
RemovingOldClosedSession Triggered when old closed sessions are being cleaned up.
MigratingSessionTo Triggered when the session is being migrated to a new code.
SessionAlreadyClosed Triggered when the session is already closed.
SessionAlreadyOpen Triggered when the session is already open.
SessionStorageMigrationError Triggered when an error occurs during session storage migration.

| Note: If no callback is provided for an event, the log will print normally to the console.

**--------------------------------------------------------**

🚀 Getting Started Development

1. Installation
   Clone the repository and install dependencies:

```bash
git clone https://github.com/Developer-Marcelo/baileys-prisma
cd baileys-prisma
npm install
```

Simple Access: Use the main instance for common features.

Native Access: Access the .others property to interact directly with the native Baileys API.

🏗️ Architecture Overview
The system follows Dependency Inversion from SOLID:

2. BaileysFactory: Orquestrates the creation of the socket, repository, and service.

3. WhatsappConnectionService: Contains the business logic for managing connection states (Application Layer).

4. BaileysProvider: An infrastructure adapter that isolates the baileys library from the rest of the code.

5. Prisma Repository: Handles the persistence of creds.json directly into the database.

```
Option,Type,Description

sessionId,string,Unique identifier for the WhatsApp instance.
isPairCode,boolean,"If true, uses the 8-digit pairing code. If false, generates a QR Code."
timeReconnect,number,Seconds to wait before attempting a restart after a 515 error.
browserName,string,"The browser agent name (e.g., ""Chrome"", ""Firefox"")."

```
