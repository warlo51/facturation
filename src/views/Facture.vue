<script setup>
import {ref, computed, watch, onMounted} from "vue";
import {PDFDocument, PDFName, rgb} from "pdf-lib";
import { saveAs } from "file-saver";
import {client} from "../../sanity.js";
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref([]);
const artisan = ref({});

const pdfBlob = ref(null);
const nomClient = ref("");
const adresseClient = ref("");
const cpClient = ref("");
const dateFacture = ref("");
const numeroFacture = ref("");
const sections = ref([]);
const pdfUrl = ref("");

onMounted(async () => {
  const id = route.query.id
  if (id) {
    const query = `*[_type == "facture" && _id == "${id}"][0]{
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
    const params = {id}
    const result = await client.fetch(query, params)
    console.log(result)
    modifierFacture(result.fichier?.asset?.url)
  }else{
    const query = `*[_type == "professionnel"]`;
    const professionnels = await client.fetch(query);
    user.value = professionnels.filter((pro) => pro.email === 'cmansuy51@gmail.com')

    const query2 = `*[_type == "facture" && professionnel._ref == "${user.value[0]._id}"]{
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
    const result = await client.fetch(query2)

    const numFact = result.map((list) => list.title.split("-")[2])
    const plusgrand= numFact.reduce((max, current) => parseInt(current) > parseInt(max) ? current : max);
    const plusGrandAvecUn = (parseInt(plusgrand) + 1).toString().padStart(3, '0');
    numeroFacture.value = plusGrandAvecUn;
  }
})

const modifierFacture = async (url) => {
  // Chargement du PDF existant
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes, { updateMetadata: true });

  const ref = pdfDoc.catalog.get(PDFName.of('FactureJSON'));
  const factureJsonObj = pdfDoc.context.lookup(ref);

  let docJson = factureJsonObj.value();
  const decodedJson = docJson
      .replace(/#7B/g, '{')   // {
      .replace(/#7D/g, '}')   // }
      .replace(/#5B/g, '[')   // [
      .replace(/#5D/g, ']')   // ]
      .replace(/#20/g, ' ')   // espace
      .replace(/#22/g, '"')   // "
      .replace(/#2C/g, ',')   // ,
      .replace(/#3A/g, ':')   // :
      .replace(/#3B/g, ';')   // ;
      .replace(/#2E/g, '.')   // .
      .replace(/#2F/g, '/')   // /
      .replace(/#5C/g, '\\')  // \
      .replace(/#26/g, '&')   // &
      .replace(/#27/g, "'")   // apostrophe
      .replace(/#28/g, '(')   // (
      .replace(/#29/g, ')')   // )
      .replace(/#3F/g, '?')   // ?
      .replace(/#21/g, '!')   // !
      .replace(/#40/g, '@')   // @
      .replace(/#23/g, '#')   // #
      .replace(/#24/g, '$')   // $
      .replace(/#25/g, '%')   // %
      .replace(/#2B/g, '+')   // +
      .replace(/#3D/g, '=')   // =

      // Lettres accentuées
      .replace(/#E0/g, 'à')
      .replace(/#E1/g, 'á')
      .replace(/#E2/g, 'â')
      .replace(/#E3/g, 'ã')
      .replace(/#E4/g, 'ä')
      .replace(/#E5/g, 'å')
      .replace(/#E6/g, 'æ')
      .replace(/#E7/g, 'ç')
      .replace(/#E8/g, 'è')
      .replace(/#E9/g, 'é')
      .replace(/#EA/g, 'ê')
      .replace(/#EB/g, 'ë')
      .replace(/#EC/g, 'ì')
      .replace(/#ED/g, 'í')
      .replace(/#EE/g, 'î')
      .replace(/#EF/g, 'ï')
      .replace(/#F0/g, 'ð')
      .replace(/#F1/g, 'ñ')
      .replace(/#F2/g, 'ò')
      .replace(/#F3/g, 'ó')
      .replace(/#F4/g, 'ô')
      .replace(/#F5/g, 'õ')
      .replace(/#F6/g, 'ö')
      .replace(/#F9/g, 'ù')
      .replace(/#FA/g, 'ú')
      .replace(/#FB/g, 'û')
      .replace(/#FC/g, 'ü')
      .replace(/#FF/g, 'ÿ')

      // Majuscules accentuées
      .replace(/#C0/g, 'À')
      .replace(/#C1/g, 'Á')
      .replace(/#C2/g, 'Â')
      .replace(/#C3/g, 'Ã')
      .replace(/#C4/g, 'Ä')
      .replace(/#C5/g, 'Å')
      .replace(/#C6/g, 'Æ')
      .replace(/#C7/g, 'Ç')
      .replace(/#C8/g, 'È')
      .replace(/#C9/g, 'É')
      .replace(/#CA/g, 'Ê')
      .replace(/#CB/g, 'Ë')
      .replace(/#CC/g, 'Ì')
      .replace(/#CD/g, 'Í')
      .replace(/#CE/g, 'Î')
      .replace(/#CF/g, 'Ï')
      .replace(/#D1/g, 'Ñ')
      .replace(/#D2/g, 'Ò')
      .replace(/#D3/g, 'Ó')
      .replace(/#D4/g, 'Ô')
      .replace(/#D5/g, 'Õ')
      .replace(/#D6/g, 'Ö')
      .replace(/#D9/g, 'Ù')
      .replace(/#DA/g, 'Ú')
      .replace(/#DB/g, 'Û')
      .replace(/#DC/g, 'Ü')
      .replace(/#DF/g, 'ß');


  let cleanJson = decodedJson.replace('[FACTURE_JSON]', '');
  cleanJson = cleanJson.substring(1);

  const devisData = JSON.parse(cleanJson);

  if (!devisData) {
    console.error('Aucune donnée FactureJSON trouvée dans le catalogue du PDF.');
    return;
  }

  numeroFacture.value = devisData.numero || '';
  artisan.value = devisData.artisan || '';
  dateFacture.value = devisData.date || '';

  nomClient.value = devisData.client?.nom || '';
  adresseClient.value = devisData.client?.adresse || '';
  cpClient.value = devisData.client?.cp || '';

  sections.value = devisData.sections || [];
};

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

const ajouterTitre = () => {
  sections.value.push({
    titre: "",
    lignes: [{label: "", quantite: null, pu: null}],
  });
};

const ajouterLigne = (section) => {
  section.lignes.push({label: "", quantite: null, pu: null});
};

const supprimerLigne = (section, index) => {
  if (section.lignes.length > 1) {
    section.lignes.splice(index, 1);
  }
};

const supprimerTitre = (sectionIndex) => {
  sections.value.splice(sectionIndex, 1);
};

const totalLigne = (ligne) => ligne.quantite * ligne.pu;
const totalFacture = computed(() =>
    sections.value.reduce(
        (total, section) =>
            total +
            section.lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0),
        0
    )
);

const genererPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  let y = 750;

  page.drawText(`${artisan.value?.status}`, { x: 50, y, size: 16 });
  page.drawText(`${artisan.value?.nom}`, { x: 50, y: y - 20, size: 16 });
  page.drawText(`${artisan.value?.adresse}`, { x: 50, y: y - 40, size: 12 });
  page.drawText(`${artisan.value?.code_postal}`, { x: 50, y: y - 60, size: 12 });
  page.drawText(`Tél: ${artisan.value?.telephone}`, { x: 50, y: y - 80, size: 12 });
  page.drawText(`Email: ${artisan.value?.email}`, { x: 50, y: y - 100, size: 12 });
  page.drawText(`SIREN: ${artisan.value?.siren}`, { x: 50, y: y - 120, size: 12 });

  page.drawText(`Fact N° FAC-${new Date().getFullYear()}-${numeroFacture.value}`, { x: 350, y, size: 16 });
  page.drawText(`Date : ${dateFacture.value}`, { x: 350, y: y - 20, size: 12 });
  page.drawText(`Client : ${nomClient.value}`, { x: 350, y: y - 40, size: 12 });
  page.drawText(`Adresse: ${adresseClient.value}`, { x: 350, y: y - 60, size: 12 });
  page.drawText(`CP: ${cpClient.value}`, { x: 350, y: y - 80, size: 12 });

  y -= 160;
  sections.value.forEach((section) => {
    page.drawText(section.titre, {x: 50, y, size: 14, color: rgb(0, 0, 0)});
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

      const maxWidth = 60;

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
  page.drawText(`Net à payer : ${totalFacture.value.toFixed(2)} €`, {x: 450, y, size: 12});
  y -= 40;
  page.drawText(`TVA non applicable, article 293 B du Code Général des impôts`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });

  const factureData = {
    numero: numeroFacture.value,
    artisan: artisan.value,
    date: dateFacture.value,
    client: {
      nom: nomClient.value,
      adresse: adresseClient.value,
      cp: cpClient.value
    },
    sections: sections.value
  };

  const jsonText = `[FACTURE_JSON]${JSON.stringify(factureData)}`;
  const jsonValue = pdfDoc.context.obj(jsonText); // crée une chaîne PDF propre

// Ici on met "DevisJSON" comme clé, et la chaîne JSON comme valeur
  pdfDoc.catalog.set(PDFName.of('FactureJSON'), jsonValue);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], {type: "application/pdf"});
  pdfUrl.value = URL.createObjectURL(blob);
  pdfBlob.value = new Blob([pdfBytes], { type: "application/pdf" });
};

function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  lines.push(currentLine);
  return lines;
}

const telechargerPDF = async () => {
  if (pdfBlob.value) {
    saveAs(pdfBlob.value, `Fact N° FAC-${new Date().getFullYear()}-${numeroFacture.value}`);

    const fileAsset = await client.assets.upload("file", pdfBlob.value, {
      filename: `Fact N° FAC-${new Date().getFullYear()}-${numeroFacture.value}`,
    });

    // 2️⃣ Créer l'objet "facture" et l'enregistrer dans Sanity
    const facture = {
      _type: "facture",
      title: `Fact N° FAC-${new Date().getFullYear()}-${numeroFacture.value}`,
      date: dateFacture.value,
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

    const id = route.query.id
    if (id) {
      // Si l'ID existe, mise à jour du document
      try {
        await client
            .patch(id)
            .set(facture)
            .commit();
        alert("Facture modifié dans ton espace avec succès !");
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture :', error);
      }
    } else {
      // Si l'ID n'existe pas, création d'un nouveau document
      try {
        await client.create(facture);
        alert("Facture sauvegarder dans ton espace avec succès !");
      } catch (error) {
        console.error('Erreur lors de la création de la facture :', error);
      }
    }
  }
};

watch([nomClient, adresseClient, cpClient, dateFacture, numeroFacture, sections], genererPDF, {deep: true});
</script>

<template>
  <div class="principal-div">
    <div class="input-div">
      <h2 class="text-2xl font-bold mb-6 text-center">Créer une Facture</h2>
      <div class="input-div">
        <label>Numéro de Facture : </label>
        <input v-model="numeroFacture" type="text" class="border p-2 rounded w-full" placeholder="Ex: 0001"/>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="input-div">
          <label>Date :</label>
          <input v-model="dateFacture" type="date" class="border p-2 rounded w-full"/>
        </div>
        <div class="input-div">
          <label>Nom du Client : </label>
          <input v-model="nomClient" type="text" class="border p-2 rounded w-full"/>
        </div>
      </div>
      <div class="input-div">
        <label>Adresse du Client : </label>
        <input v-model="adresseClient" class="border p-2 rounded w-full"/>
      </div>
      <div class="input-div">
        <label>CP du Client : </label>
        <input v-model="cpClient" class="border p-2 rounded w-full"/>
      </div>
      <h3 class="text-lg font-semibold mb-4">Détails de la Facture</h3>
      <button @click="ajouterTitre" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Ajouter un titre</button>
      <div v-for="(section, sectionIndex) in sections" :key="sectionIndex" class="border p-4 rounded-lg mb-6">
        <div class="flex justify-between items-center mb-2">
          <input v-model="section.titre" type="text" class="border p-2 rounded font-bold w-full" placeholder="Titre"/>
          <button @click="supprimerTitre(sectionIndex)" class="ml-6 text-red-500">🗑</button>
        </div>
        <div class="border rounded-lg overflow-hidden">
          <div v-for="(ligne, ligneIndex) in section.lignes" :key="ligneIndex" class="flex border-t p-2 items-center">
            <input v-model="ligne.label" type="text" class="w-1/2 border p-2 rounded" placeholder="Désignation"/>
            <input v-model.number="ligne.quantite" type="number" class="w-1/6 border p-2 rounded text-center"/>
            <input v-model.number="ligne.pu" type="number" class="w-1/6 border p-2 rounded text-center"/>
            <button @click="supprimerLigne(section, ligneIndex)" class="text-red-500 ml-2">🗑</button>
          </div>
        </div>
        <button @click="ajouterLigne(section)" class="bg-gray-500 text-white px-4 py-2 rounded mt-2">+ Ajouter une
          ligne
        </button>
      </div>
      <button @click="telechargerPDF" class="bg-green-500 text-white px-6 py-2 rounded mt-4 w-full">Télécharger la facture</button>
    </div>
    <iframe v-if="pdfUrl" :src="pdfUrl" class="preview-div"></iframe>
  </div>
</template>
