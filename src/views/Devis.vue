<script setup>
import { ref, computed, watch } from "vue";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// Infos de l'artisan
const artisan = {
  nom: "Christian Mansuy",
  adresse: "24 rue Alphonse de Lamartine",
  code_postal: " 51100 Reims",
  telephone: "06-31-74-36-45",
  email: "cmansuy51@gmail.com",
  siren: "539 857 797",
};

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
  page.drawText(`${artisan.nom}`, { x: 50, y, size: 16 });
  page.drawText(`${artisan.adresse}`, { x: 50, y: y - 20, size: 12 });
  page.drawText(`${artisan.code_postal}`, { x: 50, y: y - 40, size: 12 });
  page.drawText(`Tél: ${artisan.telephone}`, { x: 50, y: y - 60, size: 12 });
  page.drawText(`Email: ${artisan.email}`, { x: 50, y: y - 80, size: 12 });
  page.drawText(`SIREN: ${artisan.siren}`, { x: 50, y: y - 100, size: 12 });

  page.drawText(`Devis N° DEV-${new Date().getFullYear()}-${numeroDevis.value}`, { x: 350, y, size: 16 });
  page.drawText(`Date : ${dateDevis.value}`, { x: 350, y: y - 20, size: 12 });
  page.drawText(`Client : ${nomClient.value}`, { x: 350, y: y - 40, size: 12 });
  page.drawText(`Adresse: ${adresseClient.value}`, { x: 350, y: y - 60, size: 12 });
  page.drawText(`CP: ${cpClient.value}`, { x: 350, y: y - 80, size: 12 });

  y -= 160;

  sections.value.forEach((section) => {
    page.drawText(section.titre, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
    y -= 40;

    const headers = ["Désignation", "Qté", "P.U", "Total"];
    const positions = [50, 250, 350, 450];

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
      const values = [ligne.label, ligne.quantite, ligne.pu.toFixed(2) + " €", totalLigne(ligne).toFixed(2) + " €"];
      values.forEach((text, index) => {
        page.drawText(text.toString(), { x: positions[index], y, size: 12 });
      });
      y -= 20;
    });

    y -= 10;
  });

  y -= 20;
  page.drawText(`Total : ${totalDevis.value.toFixed(2)} €`, { x: 450, y, size: 14, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  pdfUrl.value = URL.createObjectURL(blob);
  pdfBlob.value = new Blob([pdfBytes], { type: "application/pdf" });
};

const telechargerPDF = () => {
  if (pdfBlob.value) {
    saveAs(pdfBlob.value, "devis.pdf");
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
        <label class="block font-semibold">Numéro de Devis :</label>
        <input v-model="numeroDevis" type="text" class="w-full border p-2 rounded" placeholder="Ex: 0001" />
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="input-div">
          <label class="block font-semibold">Date :</label>
          <input v-model="dateDevis" type="date" class="w-full border p-2 rounded" />
        </div>
        <div class="input-div">
          <label class="block font-semibold">Nom du Client :</label>
          <input v-model="nomClient" type="text" class="w-full border p-2 rounded" />
        </div>
      </div>

      <div class="input-div">
        <label class="block font-semibold">Adresse du Client :</label>
        <input v-model="adresseClient" class="w-full border p-2 rounded"></input>
      </div>
      <div class="input-div">
        <label class="block font-semibold">CP du Client :</label>
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
      </div>
      <button @click="telechargerPDF" class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full">Télécharger le Devis</button>
    </div>

    <iframe v-if="pdfUrl" :src="pdfUrl" class="preview-div"></iframe>
  </div>
</template>
