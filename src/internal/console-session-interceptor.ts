type ConsoleMethod = (...args: any[]) => void;

function wrapConsole(
  original: ConsoleMethod,
  handler: (args: any[]) => boolean
): ConsoleMethod {
  return (...args: any[]) => {
    const handled = handler(args);
    if (!handled) {
      original(...args);
    }
  };
}

export function interceptSessionLogs() {
  console.info = wrapConsole(console.info, (args) => {
    if (typeof args[0] === "string") {
      if (args[0].startsWith("Closing session:")) {
        console.info("🔐 Renovação de chaves de sessão");
        return true;
      }

      if (args[0].startsWith("Opening session:")) {
        console.info("🟢 Sessão criptográfica aberta");
        return true;
      }

      if (args[0].startsWith("Removing old closed session:")) {
        console.info("🧹 Limpando sessões criptográficas antigas");
        return true;
      }

      if (args[0].startsWith("Migrating session to:")) {
        console.info("🔄 Migrando estrutura de sessão");
        return true;
      }
    }
    return false;
  });

  console.warn = wrapConsole(console.warn, (args) => {
    if (typeof args[0] === "string") {
      if (args[0].startsWith("Session already closed")) {
        console.warn("⚠️ Sessão já estava encerrada");
        return true;
      }

      if (args[0].startsWith("Session already open")) {
        console.warn("⚠️ Sessão já estava aberta");
        return true;
      }
    }
    return false;
  });

  console.error = wrapConsole(console.error, (args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("session storage migration error")
    ) {
      console.error("❌ Erro ao migrar armazenamento de sessão criptográfica");
      return true;
    }
    return false;
  });
}
