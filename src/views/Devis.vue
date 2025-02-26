<script setup>
import {ref, computed, watch, onBeforeMount, onMounted} from "vue";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {client} from "../../sanity.js";

const user = ref([]);
const artisan = ref({});

function splitStringAvoidWordCut(str, maxLength) {
  let start = 0;
  const result = [];
  while (start < str.length) {
    let end = start + maxLength;

    // Si le mot est coupé, on ajuste la fin pour le découper à un espace
    if (end < str.length && str[end] !== ' ' && str.lastIndexOf(' ', end) > start) {
      end = str.lastIndexOf(' ', end); // Trouver la dernière espace avant 'end'
    }

    result.push(str.slice(start, end).trim());  // Ajouter le morceau sans espace inutile
    start = end;  // Avancer le début pour le prochain morceau
  }
  return result
}

const fetchProfessionnels = async () => {
  const query = `*[_type == "professionnel"]`;
  const professionnels = await client.fetch(query);
  user.value = professionnels.filter((pro) => pro.email === 'cmansuy51@gmail.com')
  artisan.value = {
    status: user.value[0]?.statut,
    nom: user.value[0]?.name,
    adresse: user.value[0]?.adresse,
    code_postal: user.value[0]?.cp,
    telephone: user.value[0]?.phone,
    email: user.value[0]?.email,
    siren: user.value[0]?.siren,
  };
};

onMounted(async () => {
  await fetchProfessionnels()
})

// Champs du formulaire
const pdfBlob = ref(null);
const nomClient = ref("");
const adresseClient = ref("");
const cpClient = ref("");
const dateDevis = ref("");
const numeroDevis = ref("");
const sections = ref([]);
const pdfUrl = ref("");

// Ajouter une section (titre)
const ajouterTitre = () => {
  sections.value.push({
    titre: ``,
    lignes: [{ label: "", quantite: null, pu: null }],
  });
};

// Ajouter une ligne
const ajouterLigne = (section) => {
  section.lignes.push({ label: "", quantite: null, pu: null });
};

// Supprimer une ligne
const supprimerLigne = (section, index) => {
  if (section.lignes.length > 1) {
    section.lignes.splice(index, 1);
  }
};

// Supprimer une section
const supprimerTitre = (sectionIndex) => {
  sections.value.splice(sectionIndex, 1);
};

// Calcul des totaux
const totalLigne = (ligne) => ligne.quantite * ligne.pu;
const totalDevis = computed(() =>
    sections.value.reduce(
        (total, section) =>
            total +
            section.lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0),
        0
    )
);

// Génération et affichage du PDF
const genererPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  let y = 750;

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Infos de l'artisan
  page.drawText(`${artisan.value?.status}`, { x: 50, y, size: 16 });
  page.drawText(`${artisan.value?.nom}`, { x: 50, y: y - 20, size: 16 });
  page.drawText(`${artisan.value?.adresse}`, { x: 50, y: y - 40, size: 12 });
  page.drawText(`${artisan.value?.code_postal}`, { x: 50, y: y - 60, size: 12 });
  page.drawText(`Tél: ${artisan.value?.telephone}`, { x: 50, y: y - 80, size: 12 });
  page.drawText(`Email: ${artisan.value?.email}`, { x: 50, y: y - 100, size: 12 });
  page.drawText(`SIREN: ${artisan.value?.siren}`, { x: 50, y: y - 120, size: 12 });

  page.drawText(`Devis N° DEV-${new Date().getFullYear()}-${numeroDevis.value}`, { x: 350, y, size: 16 });
  page.drawText(`Valable 3 mois`, { x: 350, y: y - 20, size: 12 });
  page.drawText(`Date : ${dateDevis.value}`, { x: 350, y: y - 40, size: 12 });
  page.drawText(`Client : ${nomClient.value}`, { x: 350, y: y - 60, size: 12 });
  page.drawText(`Adresse: ${adresseClient.value}`, { x: 350, y: y - 80, size: 12 });
  page.drawText(`CP: ${cpClient.value}`, { x: 350, y: y - 100, size: 12 });

  y -= 160;

  sections.value.forEach((section) => {
    page.drawText(section.titre, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
    y -= 40;

    const headers = ["Désignation", "Qté", "P.U", "Total"];
    const positions = [50, 380, 420, 500];

    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 500,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });

    headers.forEach((text, index) => {
      page.drawText(text, { x: positions[index], y, size: 12, color: rgb(0, 0, 0) });
    });

    y -= 20;

    section.lignes.forEach((ligne) => {
      const quantite = ligne.quantite === 0 || ligne.quantite === null ? '' : ligne.quantite;
      const pu = ligne.quantite === 0 || ligne.quantite === null ? '' : ligne.pu.toFixed(2) + " €";
      const total = ligne.quantite === 0 || ligne.quantite === null ? '' : totalLigne(ligne).toFixed(2) + " €";
      const values = [ligne.label, quantite, pu, total];

      const maxWidth = 38;

      const labelsLines = splitStringAvoidWordCut(ligne.label,maxWidth );

      values.forEach((text, index) => {
        if(labelsLines.length > 1 && index === 0) {
          let yPosition = y;
          const lineHeight = 20;

          labelsLines.forEach((text, index2) => {
            page.drawText(text.toString(), { x: positions[0], y: yPosition, size: 12 });
            yPosition -= lineHeight;
          });
        }else{
          page.drawText(text.toString(), { x: positions[index], y, size: 12 });
        }
      });
      y -= labelsLines.length > 1 ? labelsLines.length * 25 : 20;
    });

    y -= 10;
  });

  y -= 20;
  page.drawText(`Total : ${totalDevis.value.toFixed(2)} €`, { x: 450, y, size: 12, color: rgb(0, 0, 0) });
  y -= 40;
  page.drawText(`Le montant peut etre révisé en fonction du temps réel passé sur le chantier`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
  y -= 20;
  page.drawText(`et de l'ajustement des fournitures et/ou des prix`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
  y -= 20;
  page.drawText(`TVA non applicable, article 293 B du Code Général des impôts`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
  y -= 40;
  page.drawText(`Le client`, { x: 50, y, size: 12, font: fontBold,color: rgb(0, 0, 0) });
  page.drawText(`${artisan.value?.nom}`, { x: 350, y, size: 12, font: fontBold,color: rgb(0, 0, 0) });
  y -= 20;
  page.drawText(`Mention manuscrite et datée:`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
  y -= 20;
  page.drawText(`"Devis reçu avant l'exécution des travaux."`, { x: 50, y, size: 9, color: rgb(0, 0, 0) });
  y -= 20;
  page.drawText(`Bon pour travaux. "`, { x: 50, y, size: 9, color: rgb(0, 0, 0) });

 const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  pdfUrl.value = URL.createObjectURL(blob);
  pdfBlob.value = new Blob([pdfBytes], { type: "application/pdf" });
};

const telechargerPDF = async () => {
  if (pdfBlob.value) {
    saveAs(pdfBlob.value, `Devis N° DEV-${new Date().getFullYear()}-${numeroDevis.value}`);

    const fileAsset = await client.assets.upload("file", pdfBlob.value, {
      filename: `Devis N° DEV-${new Date().getFullYear()}-${numeroDevis.value}`,
    });

    // 2️⃣ Créer l'objet "facture" et l'enregistrer dans Sanity
    const devis = {
      _type: "devis",
      title: `Devis N° DEV-${new Date().getFullYear()}-${numeroDevis.value}`,
      date: dateDevis.value,
      client: nomClient.value,
      fichier: {
        _type: "file",
        asset: {
          _ref: fileAsset._id,
        },
      },
      professionnel: {
        _type: "reference",
        _ref: user.value[0]?._id,
      },
    };

    await client.create(devis);
    alert("Devis sauvegarder dans ton espace avec succès !");
  }
};

// Mise à jour automatique du PDF à chaque modification
watch([nomClient, adresseClient, cpClient, dateDevis, numeroDevis, sections], genererPDF, { deep: true });

</script>

<template>
  <div class="principal-div">
    <div class="input-div">
      <h2 class="text-2xl font-bold mb-6 text-center">Créer un Devis</h2>

      <div class="input-div">
        <label class="block font-semibold">Numéro de Devis : </label>
        <input v-model="numeroDevis" type="text" class="w-full border p-2 rounded" placeholder="Ex: 0001" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="input-div">
          <label class="block font-semibold">Date : </label>
          <input v-model="dateDevis" type="date" class="w-full border p-2 rounded" />
        </div>
        <div class="input-div">
          <label class="block font-semibold">Nom du Client : </label>
          <input v-model="nomClient" type="text" class="w-full border p-2 rounded" />
        </div>
      </div>

      <div class="input-div">
        <label class="block font-semibold">Adresse du Client : </label>
        <input v-model="adresseClient" class="w-full border p-2 rounded"></input>
      </div>
      <div class="input-div">
        <label class="block font-semibold">CP du Client : </label>
        <input v-model="cpClient" class="w-full border p-2 rounded"></input>
      </div>

      <h3 class="text-lg font-semibold mb-4">Détails du Devis</h3>

      <button @click="ajouterTitre" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Ajouter un titre</button>

      <div v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="border-title p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center mb-2">
          <input v-model="section.titre" type="text" class="w-full border p-2 rounded font-bold text-lg" placeholder="Titre"/>
          <button @click="supprimerTitre(sectionIndex)" class="ml-6 text-red-500">🗑</button>
        </div>

        <div v-for="(ligne, ligneIndex) in section.lignes" :key="ligneIndex" class="flex border-t p-2 items-center">
          <input v-model="ligne.label" type="text" class="w-1/2 border p-2 rounded" placeholder="Désignation"/>
          <input v-model.number="ligne.quantite" type="number" class="w-1/6 border p-2 rounded text-center" placeholder="Quantité" />
          <input v-model.number="ligne.pu" type="number" class="w-1/6 border p-2 rounded text-center" placeholder="PU"/>
          <button @click="supprimerLigne(section, ligneIndex)" class="text-red-500 ml-2">🗑</button>
        </div>
        <button @click="ajouterLigne(section)" class="bg-gray-500 text-white px-4 py-2 rounded mt-2">+ Ajouter une
          ligne
        </button>
      </div>
      <button @click="telechargerPDF" class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full">Télécharger le Devis</button>
    </div>

    <iframe v-if="pdfUrl" :src="pdfUrl" class="preview-div"></iframe>
  </div>
</template>
