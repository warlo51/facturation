<template>
  <div>
    <nav class="mb-4">
      <router-link to="/facture" class="text-blue-500 mr-4">Facture</router-link>
      <router-link to="/devis" class="text-blue-500">Devis</router-link>
    </nav>

    <!-- Le composant de la page active sera injecté ici -->
    <router-view></router-view>
  </div>
</template>
