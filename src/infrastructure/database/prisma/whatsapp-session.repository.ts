import {
  AuthenticationCreds,
  SignalDataTypeMap,
  toNumber,
  proto,
  BufferJSON,
  initAuthCreds,
} from "baileys";
import Long from "long";
import type {
  MakeTransformedPrisma,
  MakeSerializedPrisma,
} from "@/domain/whatsapp/whatsapp.types";
import { PrismaClient } from "@/infrastructure/database/prisma/generated/prisma/client";
import { PrismaClientKnownRequestError } from "@/infrastructure/database/prisma/generated/prisma/internal/prismaNamespace";
import {
  WhatsappRepositoryInterface,
  WhatsappSessionInterface,
} from "@/domain/whatsapp/whatsapp.repository";

export class WhatsappSessionRepository implements WhatsappRepositoryInterface {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static build(prismaClient: PrismaClient) {
    return new WhatsappSessionRepository(prismaClient);
  }

  async session(
    sessionId: string,
    logs: boolean = false
  ): Promise<WhatsappSessionInterface> {
    const write = async (data: any, id: string) => {
      data = JSON.stringify(data, BufferJSON.replacer);
      id = this.fixId(id);
      await this.prismaClient.session.upsert({
        select: { pkId: true },
        create: { data, id, sessionId },
        update: { data },
        where: { sessionId_id: { id, sessionId } },
      });
    };

    const read = async (id: string) => {
      try {
        const { data } = await this.prismaClient.session.findUniqueOrThrow({
          select: { data: true },
          where: { sessionId_id: { id: this.fixId(id), sessionId } },
        });
        return JSON.parse(data, BufferJSON.reviver);
      } catch (e) {
        if (logs) {
          if (
            e instanceof PrismaClientKnownRequestError &&
            e.code === "P2025"
          ) {
            console.log({ id }, "Trying to read non existent session data");
          }
          console.log(e, "An error occured during session read");
        }
        return null;
      }
    };

    const del = async (id: string) => {
      try {
        id = this.fixId(id);
        await this.prismaClient.session.deleteMany({
          where: {
            sessionId: id,
          },
        });
      } catch (e) {
        if (logs) {
          console.log(e, "An error occured during session delete");
        }
      }
    };

    const creds: AuthenticationCreds = (await read("creds")) || initAuthCreds();

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
                let value = await read(`${type}-${id}`);
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
                tasks.push(value ? write(value, sId) : del(sId));
              }
            }
            await Promise.all(tasks);
          },
        },
      },
      saveCreds: () => write(creds, "creds"),
      delete: del,
    };
  }

  public get prisma() {
    return this.prismaClient;
  }

  public static transformPrisma<T extends Record<string, any>>(
    data: T,
    removeNullable = true
  ): MakeTransformedPrisma<T> {
    const obj = { ...data } as any;

    for (const [key, val] of Object.entries(obj)) {
      if (val instanceof Uint8Array) {
        obj[key] = Buffer.from(val);
      } else if (typeof val === "number" || val instanceof Long) {
        obj[key] = toNumber(val);
      } else if (
        removeNullable &&
        (typeof val === "undefined" || val === null)
      ) {
        delete obj[key];
      }
    }

    return obj;
  }

  public static serializePrisma<T extends Record<string, any>>(
    data: T,
    removeNullable = true
  ): MakeSerializedPrisma<T> {
    const obj = { ...data } as any;

    for (const [key, val] of Object.entries(obj)) {
      if (val instanceof Buffer) {
        obj[key] = val.toJSON();
      } else if (typeof val === "bigint" || val instanceof BigInt) {
        obj[key] = val.toString();
      } else if (
        removeNullable &&
        (typeof val === "undefined" || val === null)
      ) {
        delete obj[key];
      }
    }

    return obj;
  }

  private fixId(id: string) {
    return id.replace(/\//g, "__").replace(/:/g, "-");
  }
}
