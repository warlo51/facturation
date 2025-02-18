<template>
  <div class="main-div">
    <nav class="bg-green-600 p-4 rounded-lg shadow-lg">
      <div class="flex justify-center space-x-6">
        <!-- Facture -->
        <button class="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-110">
          <router-link to="/facture" class="block text-center font-semibold">Facture</router-link>
        </button>

        <!-- Devis -->
        <button class="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-110">
          <router-link to="/devis" class="block text-center font-semibold">Devis</router-link>
        </button>

        <!-- Historique -->
        <button class="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-110">
          <router-link to="/historique" class="block text-center font-semibold">Historique</router-link>
        </button>
      </div>
    </nav>


    <!-- Le composant de la page active sera injecté ici -->
    <router-view></router-view>
  </div>
</template>
<script setup>
import "./style.css";

</script>
