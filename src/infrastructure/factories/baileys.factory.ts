import { WhatsappSessionService } from "@/application/whatsapp/whatsapp.service";
import { BaileysEntity } from "@/domain/baileys/baileys.entity";
import { WhatsappSessionRepository } from "@/infrastructure/database/prisma/whatsapp-session.repository";
import { WhatsappConnectionService } from "@/application/whatsapp/whatsapp-connection.service";
import { BrowserName } from "@/domain/whatsapp/whatsapp.interface";
import { BaileysProvider } from "../providers/baileys-provider";
import { WhatsappSessionInterface } from "@/domain/whatsapp/whatsapp.repository";
import { BaileysService } from "@/application/baileys/baileys.service";
import { PrismaSessionStore } from "@/infrastructure/database/prisma/prisma-session-store";
import { SessionRepository } from "@/domain/session/session.repository";
import makeWASocket, { Browsers } from "baileys";
import P from "pino";

export class BaileysFactory {
  private constructor() {}

  public static async create(
    sessionId: string,
    browserName: BrowserName,
    prisma: SessionRepository
  ): Promise<{
    socket: BaileysEntity;
    connectionService: WhatsappConnectionService;
    session: WhatsappSessionInterface;
    baileysService: BaileysService;
    prisma: SessionRepository;
  }> {
    const prismaClient = PrismaSessionStore.build(prisma);
    const repository = WhatsappSessionRepository.build(prismaClient.prisma);
    const whatsappService = WhatsappSessionService.build(repository);
    const sessionCreate = await whatsappService.session(sessionId, false);

    const socket = makeWASocket({
      auth: sessionCreate.state,
      logger: P({ level: "silent" }),
      browser: Browsers.appropriate(browserName),
    });

    const provider = new BaileysProvider(socket);

    const connectionService = new WhatsappConnectionService(
      provider,
      sessionCreate
    );

    const baileysEntity = await BaileysEntity.build(socket);
    const baileysService = BaileysService.build(baileysEntity);
    baileysService;
    return {
      socket: baileysEntity,
      connectionService,
      session: sessionCreate,
      baileysService,
      prisma: prismaClient.prisma,
    };
  }
}
