import sanityClient from "@sanity/client";

export const client = sanityClient({
    projectId: "3k4cyz36", // Remplace par ton ID de projet
    dataset: "production", // Ou un autre dataset si applicable
    useCdn: false, // true pour une meilleure performance, false si besoin de données récentes
    apiVersion: "2022-03-07", // Utilise la dernière version disponible
    token: import.meta.env.VITE_SANITY_TOKEN,
});
