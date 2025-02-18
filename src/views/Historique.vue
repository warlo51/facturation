<script setup>
import {ref, onMounted} from "vue";
import {client} from "../../sanity.js";

const user = ref([]);
const clientNom = ref("");
const listeFactures = ref([]);
const watchPdf = ref("")

const fetchProfessionnels = async () => {
  const query = `*[_type == "professionnel"]`;
  const professionnels = await client.fetch(query);
  user.value = professionnels.filter((pro) => pro.email === 'cmansuy51@gmail.com')
};

onMounted(async () => {
  await fetchProfessionnels()
})

const rechercher = async () => {
  if (clientNom.value) {
    const query = `*[_type == "facture" && client == "${clientNom.value}" && professionnel._ref == "${user.value[0]._id}"]{
  _id,
  title,
  date,
  client,
  fichier{
    asset->{
      _id,
      url
    }
  },
  professionnel->{
    _id,
    title
  }
}`;
    const query2 = `*[_type == "devis" && client == "${clientNom.value}" && professionnel._ref == "${user.value[0]._id}"]{
  _id,
  title,
  date,
  client,
  fichier{
    asset->{
      _id,
      url
    }
  },
  professionnel->{
    _id,
    title
  }
}`;
    const [result1, result2] = await Promise.all([client.fetch(query), client.fetch(query2)]);
    const list = [...result1, ...result2];
    listeFactures.value = list;
  }
};

</script>

<template>
  <div class="principal-div">
    <div class="input-div">
      <div>
        <label >Rechercher par nom de client : </label>
        <input v-model="clientNom" class="border p-2 rounded w-full"/>
        <button @click="rechercher()" class="ml-6 text-red-500">Rechercher</button>
      </div>
      <table class="min-w-full table-auto border-collapse" v-if="listeFactures.length">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="px-4 py-2 font-semibold text-gray-700">Nom Facture</th>
          <th class="px-4 py-2 font-semibold text-gray-700">Date de Création</th>
          <th class="px-4 py-2 font-semibold text-gray-700">PDF</th>
        </tr>
        </thead>
        <tbody>
        <tr class="border-t" v-for="list of listeFactures" :key="list._id">
          <td class="px-4 py-2 text-gray-700">{{ list.title }}</td>
          <td class="px-4 py-2 text-gray-700">{{ list.date }}</td>
          <td class="px-4 py-2">
            <button @click="watchPdf = list.fichier?.asset?.url" class="ml-6 text-red-500">Voir</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <iframe v-if="watchPdf" :src="watchPdf" class="preview-div"></iframe>
  </div>
</template>
