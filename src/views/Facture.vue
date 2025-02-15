<script setup>
import { ref, computed } from "vue";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

// Infos de l'artisan (fixes dans le code)
const artisan = {
  nom: "Christian Mansuy",
  adresse: "24 rue Alphonse de Lamartine",
  code_postal: " 51100 Reims",
  telephone: "06-31-74-36-45",
  email: "cmansuy51@gmail.com",
  siren: "539 857 797",
};

// Champs de formulaire pour le client
const nomClient = ref("");
const adresseClient = ref("");
const cpClient = ref("");
const dateFacture = ref("");
const numeroFacture = ref("");  // Ajout du numéro de facture


// Liste des sections (titres) avec leurs lignes associées
const sections = ref([]);

// Ajouter un titre (section)
const ajouterTitre = () => {
  sections.value.push({
    titre: `Nouveau Titre`,
    lignes: [{ label: "", quantite: null, pu: null }],
  });
};

// Ajouter une ligne dans une section spécifique
const ajouterLigne = (section) => {
  section.lignes.push({ label: "", quantite: null, pu: null });
};

// Supprimer une ligne
const supprimerLigne = (section, index) => {
  if (section.lignes.length > 1) {
    section.lignes.splice(index, 1);
  }
};

const supprimerTitre = (sectionIndex) => {
  sections.value.splice(sectionIndex, 1); // Supprime la section à l'index donné
};

// Calcul des totaux
const totalLigne = (ligne) => ligne.quantite * ligne.pu;
const totalFacture = computed(() =>
    sections.value.reduce(
        (total, section) =>
            total +
            section.lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0),
        0
    )
);

// Génération du PDF
const genererPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  let y = 750;

  // Infos de l'artisan (en haut à gauche)
  page.drawText(`${artisan.nom}`, { x: 50, y, size: 14 });
  page.drawText(`${artisan.adresse}`, { x: 50, y: y - 20, size: 12 });
  page.drawText(`${artisan.code_postal}`, { x: 50, y: y - 40, size: 12 });
  page.drawText(`Tél: ${artisan.telephone}`, { x: 50, y: y - 60, size: 12 });
  page.drawText(`Email: ${artisan.email}`, { x: 50, y: y - 80, size: 12 });
  page.drawText(`SIREN: ${artisan.siren}`, { x: 50, y: y - 100, size: 12 });

  page.drawText(`Facture N° FAC-${new Date().getFullYear()}-${numeroFacture.value}`, { x: 350, y, size: 16 });
  page.drawText(`Date : ${dateFacture.value}`, { x: 350, y: y - 20, size: 12 });
  page.drawText(`Client : ${nomClient.value}`, { x: 350, y: y - 40, size: 12 });
  page.drawText(`Adresse: ${adresseClient.value}`, { x: 350, y: y - 60, size: 12 });
  page.drawText(`CP: ${cpClient.value}`, { x: 350, y: y - 80, size: 12 });

  y -= 160;

  sections.value.forEach((section) => {
    // Affichage du titre
    page.drawText(section.titre, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
    y -= 40;


    // En-tête du tableau avec fond gris clair
    const headers = ["Description", "Qté", "P.U", "Total"];
    const positions = [50, 250, 350, 450];

    // Dessin du fond gris clair derrière les en-têtes
    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 500,
      height: 20,
      color: rgb(0.9, 0.9, 0.9), // Gris clair
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

      // Ligne séparatrice grise
      page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) });
    });

    y -= 10;
  });

  // Total général
  y -= 20;
  page.drawText(`Total : ${totalFacture.value.toFixed(2)} €`, { x: 450, y, size: 14, color: rgb(0, 0, 0) });

  y -= 40;
  page.drawText(`TVA non applicable, article 293 B du Code Général des impôts`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });

  // Sauvegarde du PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  saveAs(blob, "facture.pdf");
};

</script>

<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
    <h2 class="text-2xl font-bold mb-6 text-center">Créer une Facture</h2>

    <!-- Numéro de Facture -->
    <div class="input-div">
      <label class="block font-semibold">Numéro de Facture :</label>
      <input v-model="numeroFacture" type="text" class="w-full border p-2 rounded" placeholder="Ex: FAC-001" />
    </div>

    <!-- Infos du client -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="input-div">
        <label class="block font-semibold">Date :</label>
        <input v-model="dateFacture" type="date" class="w-full border p-2 rounded" />
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

    <!-- Titres et lignes -->
    <h3 class="text-lg font-semibold mb-4">Détails de la Facture</h3>

    <button @click="ajouterTitre" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Ajouter un titre</button>

    <div v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="border-title p-4 rounded-lg mb-6">
      <!-- Titre avec icône suppression -->
      <div class="flex justify-between items-center mb-2">
        <input v-model="section.titre" type="text" class="w-full border p-2 rounded font-bold text-lg" />
        <button @click="supprimerTitre(sectionIndex)" class="ml-6 text-red-500">🗑</button>
      </div>

      <!-- Tableau -->
      <div class="border rounded-lg overflow-hidden">
        <div v-for="(ligne, ligneIndex) in section.lignes" :key="ligneIndex" class="flex border-t p-2 items-center">
          <input v-model="ligne.label" type="text" class="w-1/2 border p-2 rounded" placeholder="label"/>
          <input v-model.number="ligne.quantite" type="number" min="1" class="w-1/6 border p-2 rounded text-center" placeholder="quantité" />
          <input v-model.number="ligne.pu" type="number" min="0" step="0.01" class="w-1/6 border p-2 rounded text-center"  placeholder="pu"/>
          <span class="w-1/6 text-center" >{{ totalLigne(ligne).toFixed(2) }} €</span>
          <button @click="supprimerLigne(section, ligneIndex)" class="text-red-500 ml-2">🗑</button>
        </div>
      </div>

      <!-- Bouton Ajouter une ligne -->
      <button @click="ajouterLigne(section)" class="bg-gray-500 text-white px-4 py-2 rounded mt-2">+ Ajouter une ligne</button>
    </div>

    <!-- Bouton Générer la Facture -->
    <button @click="genererPDF" class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full">Générer la Facture</button>
  </div>
</template>
