import {
  AuthenticationCreds,
  SignalDataTypeMap,
  proto,
  BufferJSON,
  initAuthCreds,
} from "baileys";
import {
  WhatsappRepositoryInterface,
  WhatsappSessionInterface,
} from "@/domain/whatsapp/whatsapp.repository";
import { SessionRepository } from "@/domain/session/session.repository";

export class WhatsappSessionRepository implements WhatsappRepositoryInterface {
  private constructor(private readonly prismaClient: SessionRepository) {}

  public static build(prismaClient: SessionRepository) {
    return new WhatsappSessionRepository(prismaClient);
  }

  private async writeSessionData(
    sessionId: string,
    id: string,
    data: any
  ): Promise<void> {
    data = JSON.stringify(data, BufferJSON.replacer);
    id = this.normalizeId(id);
    await this.prismaClient.session.upsert({
      select: { pkId: true },
      create: { data, id, sessionId },
      update: { data },
      where: { sessionId_id: { id, sessionId } },
    });
  }

  private async readSessionData(
    sessionId: string,
    id: string,
    logs: boolean = false
  ): Promise<any> {
    try {
      const { data } = await this.prismaClient.session.findUniqueOrThrow({
        select: { data: true },
        where: { sessionId_id: { id: this.normalizeId(id), sessionId } },
      });
      return JSON.parse(data, BufferJSON.reviver);
    } catch (e) {
      if (logs) {
        console.log(
          { id, sessionId },
          "Session data not found or error during read"
        );
      }
      return null;
    }
  }

  private async deleteSessionData(sessionId: string): Promise<void> {
    await this.prismaClient.session.deleteMany({
      where: {
        sessionId,
      },
    });
  }

  async session(
    sessionId: string,
    logs: boolean = false
  ): Promise<WhatsappSessionInterface> {
    const creds: AuthenticationCreds =
      (await this.readSessionData(sessionId, "creds", logs)) || initAuthCreds();

    return {
      state: {
        creds,
        keys: {
          get: async <T extends keyof SignalDataTypeMap>(
            type: T,
            ids: string[]
          ): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
            const data: { [id: string]: SignalDataTypeMap[T] } = {};

            await Promise.all(
              ids.map(async (id) => {
                let value = await this.readSessionData(
                  sessionId,
                  `${type}-${id}`
                );
                if (type === "app-state-sync-key" && value) {
                  value = proto.Message.AppStateSyncKeyData.fromObject(value);
                }

                if (value) {
                  data[id] = value as SignalDataTypeMap[T];
                }
              })
            );

            return data;
          },
          set: async (data: any) => {
            const tasks: Promise<void>[] = [];

            for (const category in data) {
              for (const id in data[category]) {
                const value = data[category][id];
                const sId = `${category}-${id}`;
                tasks.push(
                  value
                    ? this.writeSessionData(sessionId, sId, value)
                    : this.deleteSessionData(sessionId)
                );
              }
            }
            await Promise.all(tasks);
          },
        },
      },
      saveCreds: () => this.writeSessionData(sessionId, "creds", creds),
      delete: () => this.deleteSessionData(sessionId),
    };
  }

  public get prisma() {
    return this.prismaClient;
  }

  private normalizeId(id: string) {
    return id.replace(/\//g, "__").replace(/:/g, "-");
  }
}
