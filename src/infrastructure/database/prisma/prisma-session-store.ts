import { SessionRepository } from "@/domain/session/session.repository";

export class PrismaSessionStore {
  private constructor(private readonly prismaClient: SessionRepository) {}

  public static build(prismaClient: SessionRepository) {
    return new PrismaSessionStore(prismaClient);
  }

  public get prisma() {
    return this.prismaClient;
  }
}
