import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Précharge le chunk d'une route au survol du lien (masque le lazy-load des graphes).
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
