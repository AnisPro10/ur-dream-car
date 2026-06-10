import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "ok",
          service: "simulateur-backend",
          time: new Date().toISOString(),
        });
      },
    },
  },
});
