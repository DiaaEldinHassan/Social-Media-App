import { bootstrap } from "./app.bootstrap";
import { closeDbConnection, closeRedisConnection } from "./DB";

bootstrap()
  .then(({ server }) => {
    const shutdown = async () => {
      server.close(async () => {
        await Promise.allSettled([closeDbConnection(), closeRedisConnection()]);
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((error) => {
    console.error("Bootstrap failed:", error);
    process.exit(1);
  });