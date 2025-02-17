<template>
  <div class="main-div">
    <nav class="mb-4">
      <button class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full"><router-link to="/facture" >Facture</router-link></button>
      <button class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full"><router-link to="/devis" >Devis</router-link></button>
    </nav>

    <!-- Le composant de la page active sera injecté ici -->
    <router-view></router-view>
  </div>
</template>
<script setup>
import "./style.css";

</script>
