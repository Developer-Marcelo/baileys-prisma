**_Maintained and developed by Marcelo BRBX. This is my first official NPM package, designed to simplify WhatsApp baileys integrations for the community._**

Baileys For Beginners 🚀
A high-level, Clean Architecture based wrapper for the Baileys library. This project simplifies WhatsApp integration by handling session management, connection states, and automatic reconnections internally.

✨ Key Features
Clean Architecture & SOLID: Logic separated into Domain, Application, and Infrastructure layers for high maintainability.

Persistent Sessions: Built-in session management using Prisma ORM. Your authentication state is safely stored in your database.

Automatic Reconnection: Internally handles common network issues and the "Restart Required" (515) error without crashing the process.

Easy Authentication: Supports both QR Code and Pairing Code (Phone Number) methods.

Event-Driven: Simple callbacks for success, failure, and authentication requirements.

Developer Friendly: Complex Baileys socket logic is hidden behind a clean Facade.

## Troubleshooting

- Database connection:
  - Ensure Docker is running and `docker-compose up -d` was executed.
  - Verify `DATABASE_URL` matches the exposed port (`5434`) and credentials.
- Prisma client not generated:
  - Run `npx prisma generate`, then `npx prisma db push`.
- Pairing code not shown:
  - Confirm `basic.isPairCode = true` and check console logs in `onAuthRequired`.
- Fatal errors (logged out, bad session, forbidden):
  - The session is automatically deleted; restart to create a fresh session.

## License

MIT

🛠️ Tech Stack

- Runtime: Node.js / TypeScript

- WA Library: baileys

- Database: Prisma ORM

- Logging: Pino

**--------------------------------------------------------**

📋 Prerequisites (Pre-configuration)
Before installing and using @marcelo-developer/baileys-beginner, you must ensure your environment is ready.

Database & Prisma Setup

"I have provided a docker-compose.yml example in the root of this repository. You can use it to set up a PostgreSQL database with Prisma ORM. Simply run:

```bash
docker-compose up -d
```

**--------------------------------------------------------**

🚀 Getting Started Production

1. Installation
   npm install baileys-beginner

2. Basic Usage
   You don't need to manage sockets or handle complex reconnection logic. Simply instantiate the library and start.

**Observation**

- A unique ID to associate this connection with a specific user in your system.

```
import { BaileysBeginner } from "baileys-beginner";
import type { WhatsappInterface } from "baileys-beginner";

const sessionId = "default";
const phoneNumber = "5521999999998";
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
};

await baileys.start(config);

const phoneExample = "5521999999999";

setTimeout(() => {
  baileys.beginner.sendMessage(phoneExample, {
    text: "Hello, World!",
  });
}, 10000);

```

**--------------------------------------------------------**

🚀 Getting Started Development

1. Installation
   Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/baileys-beginner.git
cd baileys-beginner
npm install
```

2. Database Setup
   Configure your .env file with your database URL and run migrations:

```
# Example .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Run migrations
npx prisma generate
npx prisma db push
```

3. Basic Usage
   You don't need to manage sockets or handle complex reconnection logic. Simply instantiate the library and start.

```
import { WhatsappInterface } from "@/domain/whatsapp/whatsapp.interface";
import { BaileysForBeginners } from "@/lib/baileys-for-beginners";

const sessionId = "default";
const phoneNumber = "5521999999999";

const baileys = new BaileysForBeginners(sessionId, "Chrome");

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
};

await baileys.start(config);

Simple Access: Use the main instance for common features.

Native Access: Access the .others property to interact directly with the native Baileys API.

```

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
