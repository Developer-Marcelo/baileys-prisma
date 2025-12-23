# Baileys For Beginners 🚀

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
Before installing and using npm install baileys-beginner-prisma, you must ensure your environment is ready.

Database & Prisma Setup

**--------------------------------------------------------**

🚀 Getting Started Production

1. Installation
   npm install baileys-beginner-prisma

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
import { BaileysBeginner } from "baileys-beginner-prisma";
import type { WhatsappInterface } from "baileys-beginner-prisma";
import { prisma } from "./prisma-client";

const sessionId = "default";
const phoneNumber = "5521999999999";
const browserName = "Chrome";

const baileys = new BaileysBeginner(sessionId, browserName);

const config: WhatsappInterface = {
  basic: {
    sessionId,
    phoneNumber,
    isPairCode: true,
    timeReconnect: 3,
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
  if (baileys.beginner.isConnected()) {
    baileys.beginner.sendMessage(phoneExample, {
      text: "Hello, World!",
    });
  }
}, 60 * 1000);


```

**--------------------------------------------------------**

🚀 Getting Started Development

1. Installation
   Clone the repository and install dependencies:

```bash
git clone https://github.com/Developer-Marcelo/baileys-beginner-prisma
cd baileys-beginner-prisma
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
