export interface SessionRepository {
  session: {
    upsert(args: {
      select?: { pkId?: boolean };
      create: {
        sessionId: string;
        id: string;
        data: string;
      };
      update: {
        data: string;
      };
      where: {
        sessionId_id: {
          sessionId: string;
          id: string;
        };
      };
    }): Promise<{ pkId: bigint } | null>;

    findUniqueOrThrow(args: {
      select: {
        data: true;
      };
      where: {
        sessionId_id: {
          sessionId: string;
          id: string;
        };
      };
    }): Promise<{ data: string }>;

    deleteMany(args: {
      where: {
        sessionId: string;
      };
    }): Promise<{ count: number }>;
  };
}
