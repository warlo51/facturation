import { createRouter, createWebHistory } from 'vue-router';
import Facture from './pages/Facture.vue';
import Devis from './pages/Devis.vue';

const routes = [
    {
        path: '/facture',
        name: 'Facture',
        component: Facture,
    },
    {
        path: '/devis',
        name: 'Devis',
        component: Devis,
    },
    {
        path: '/',
        redirect: '/facture', // Redirige vers /facture par défaut
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
