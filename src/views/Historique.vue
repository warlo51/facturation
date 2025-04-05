<script setup>
import {ref, onMounted, watch} from "vue";
import {client} from "../../sanity.js";

const user = ref([]);
const clientNom = ref("");
const listeFactures = ref([]);
const listeFiltered = ref([]);
const watchPdf = ref("")
const filtrerApply = ref("tout")
const objectToUpdate = ref("")

const fetchProfessionnels = async () => {
  const query = `*[_type == "professionnel"]`;
  const professionnels = await client.fetch(query);
  user.value = professionnels.filter((pro) => pro.email === 'cmansuy51@gmail.com')
};

onMounted(async () => {
  await fetchProfessionnels()
  await rechercher()
})

const rechercher = async () => {
  const query = `*[_type == "facture" && professionnel._ref == "${user.value[0]._id}"]{
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
  const query2 = `*[_type == "devis" && professionnel._ref == "${user.value[0]._id}"]{
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

  list.sort((a, b) => {
    // Convertir les valeurs en minuscules pour un tri insensible à la casse
    const clientA = a.client.toLowerCase();
    const clientB = b.client.toLowerCase();

    // Comparer les deux valeurs
    if (clientA < clientB) return -1;
    if (clientA > clientB) return 1;
    return 0;
  });

  listeFactures.value = list;
  listeFiltered.value = list;
};

const deletePdf = async (id) => {
  await client.delete(id);
  alert("Suppression réalisée avec succès !");
  await rechercher();
}
const getUrl = (file) => {
  if(file.title.includes("Fact")){
    objectToUpdate.value = `/facture?id=${file._id}`;
    return
  }
  objectToUpdate.value = `/devis?id=${file._id}`;
}

watch(filtrerApply, ()=>{
  if(filtrerApply.value === 'devis'){
    listeFiltered.value = listeFactures.value.filter((list) => list.title.includes("Devis"));
  }else if(filtrerApply.value === 'fact'){
    listeFiltered.value = listeFactures.value.filter((list) => list.title.includes("Fact"));
  }else{
    listeFiltered.value = listeFactures.value;
  }
})
</script>

<template>
  <div class="principal-div">
    <div class="input-div">
      <button @click="filtrerApply ='tout'" class="ml-6 text-red-500">Tout</button>
      <button @click="filtrerApply ='devis'" class="ml-6 text-red-500">Que Devis</button>
      <button @click="filtrerApply ='fact'" class="ml-6 text-red-500">Que factures</button>
      <table class="min-w-full table-auto border-collapse" v-if="listeFiltered.length">
        <thead>
        <tr class="bg-gray-100 text-left">
          <th class="px-4 py-2 font-semibold text-gray-700">Nom Client</th>
          <th class="px-4 py-2 font-semibold text-gray-700">Nom Facture</th>
          <th class="px-4 py-2 font-semibold text-gray-700">Date de Création</th>
          <th class="px-4 py-2 font-semibold text-gray-700">PDF</th>
        </tr>
        </thead>
        <tbody>
        <tr class="border-t" v-for="list of listeFiltered" :key="list._id">
          <td class="px-4 py-2 text-gray-700">{{ list.client }}</td>
          <td class="px-4 py-2 text-gray-700">{{ list.title }}</td>
          <td class="px-4 py-2 text-gray-700">{{ list.date }}</td>
          <td class="px-4 py-2">
            <router-link :to="objectToUpdate"><button @click="getUrl(list)" class="ml-6 text-red-500">Modifier</button></router-link>
          </td>
          <td class="px-4 py-2">
            <button @click="watchPdf = list.fichier?.asset?.url" class="ml-6 text-red-500">Voir</button>
          </td>
          <td class="px-4 py-2">
            <button @click="deletePdf(list._id)" class="ml-6 text-red-500">Supprimer</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <iframe v-if="watchPdf" :src="watchPdf" class="preview-div"></iframe>
  </div>
</template>
