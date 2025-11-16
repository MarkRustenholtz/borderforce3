
// Navigation entre les pages
  function showPage(pageId) {
    // Cacher toutes les pages
    document.querySelectorAll('.page, .home-page').forEach(page => {
      page.style.display = 'none';
      page.classList.remove('active');
    });
    
    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.style.display = pageId === 'homePage' ? 'flex' : 'block';
      targetPage.classList.add('active');
    }
    // Redimensionner le textarea QR quand on affiche cette page
  if (pageId === 'qrPage') {
    // Attendre que la page soit complètement affichée
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const resumeEl = document.getElementById('resumeEsr');
        if (resumeEl && resumeEl.value) {
          resumeEl.style.height = 'auto';
          resumeEl.style.height = resumeEl.scrollHeight + 'px';
        }
      });
    });
  }
    // Scroll vers le haut
    window.scrollTo(0, 0);
  }

  (() => {
    // Données initiales
    const state = {
      site: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      esrList: [],
      cameraNum: '',
      cameraESR: '',
      tablette1Num: '',
      tablette1ESR: '',
      tablette2Num: '',
      tablette2ESR: '',
      vehiculeService: '',
      vehicules: { train: 0, bus: 0, vl: 0, pl: 0 },
      cv: { train: 0, bus: 0, vl: 0, pl: 0 },
      cf: { train: 0, bus: 0, vl: 0, pl: 0 },
      esiList: [],
      passeurList: [],
      observations: '',
      deroulement: '',
      pulsar: '',
      editingEsrIndex: null,
      editingEsiIndex: null,
      editingPasseurIndex: null,
    };
    
    const siteConfig = {
  "La Turbie": ["bus", "vl", "pl"],
  "Breil": ["train", "bus"],
  "DSI Tende": ["train", "bus", "vl", "pl"]
};

    let saveTimeout = null;
    function debounceSave() {
      if(saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveToStorage();
      }, 3000);
    }
    
    function saveToStorage() {
      localStorage.setItem('borderforce', JSON.stringify(state));
    }
    
    function loadFromStorage() {
      const data = localStorage.getItem('borderforce');
      if(data) {
        const parsed = JSON.parse(data);
        Object.assign(state, parsed);
      }
    }

    function updateUI() {
      document.getElementById('siteSelect').value = state.site;
      document.getElementById('dateInput').value = state.date;
      document.getElementById('heureDebutInput').value = state.heureDebut;
      document.getElementById('heureFinInput').value = state.heureFin;
      renderEsrList();
      document.getElementById('cameraNum').value = state.cameraNum;
      document.getElementById('tablette1Num').value = state.tablette1Num;
      document.getElementById('tablette2Num').value = state.tablette2Num;
      document.getElementById('vehiculeService').value = state.vehiculeService;
      populateEsrSelects();
      document.getElementById('cameraESR').value = state.cameraESR || '';
      document.getElementById('tablette1ESR').value = state.tablette1ESR || '';
      document.getElementById('tablette2ESR').value = state.tablette2ESR || '';

      ['train','bus','vl','pl'].forEach(type => {
        const vEl = document.getElementById(type+'VehiclesCount');
        const cvEl = document.getElementById(type+'CvCount');
        const cfEl = document.getElementById(type+'CfCount');
        if (vEl) vEl.textContent = state.vehicules[type] || 0;
        if (cvEl) cvEl.textContent = state.cv[type] || 0;
        if (cfEl) cfEl.textContent = state.cf[type] || 0;
      });

      // Filtrage dynamique selon le site choisi
      if (state.site && siteConfig[state.site]) {
        document.querySelectorAll(".vehicle-card").forEach(c => c.style.display = "none");
        siteConfig[state.site].forEach(type => {
          const el = document.getElementById(type + "Card");
          if(el) el.style.display = "block";
        });
      } else {
        document.querySelectorAll(".vehicle-card").forEach(c => c.style.display = "block");
      }

      renderEsiList();
      renderPasseurList();
      document.getElementById('observations').value = state.observations || '';
      document.getElementById('deroulement').value = state.deroulement || '';
      
      // Mise à jour des boutons radio Pulsar
      if(state.pulsar === 'oui') {
        document.getElementById('pulsarOui').checked = true;
      } else if(state.pulsar === 'non') {
        document.getElementById('pulsarNon').checked = true;
      }
	    // Mise à jour du résumé des ESR scannés (QR Page)
  const resumeEl = document.getElementById('resumeEsr');
if (resumeEl) {
  resumeEl.value = state.resumeEsr || '';
}

  const nbScansEl = document.getElementById('nbScans');
  if (nbScansEl) {
    nbScansEl.textContent = state.scannedNigends ? state.scannedNigends.length : 0;
  }

  const nigendListEl = document.getElementById('nigendList');
  if (nigendListEl) {
    nigendListEl.textContent = state.scannedNigends && state.scannedNigends.length > 0
      ? state.scannedNigends.join(', ')
      : '—';
  }

    }

    // ESR functions
    function renderEsrList() {
      const container = document.getElementById('esrList');
      container.innerHTML = '';
      if(!state.esrList || state.esrList.length === 0) {
        container.innerHTML = '<p>Aucun ESR ajouté.</p>';
        return;
      }
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      
      state.esrList.forEach((esr,i) => {
        const li = document.createElement('li');
        li.style.background = '#f8f9fa';
        li.style.padding = '10px';
        li.style.margin = '8px 0';
        li.style.borderRadius = '6px';
        li.style.border = '1px solid #ddd';
        
        const info = document.createElement('div');
        info.textContent = `${i+1} - ${esr.grade} ${esr.nom} - ${esr.nigend} - ${esr.crt}`;
        info.style.marginBottom = '8px';
        
        const buttons = document.createElement('div');
        
        // bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifier';
        editBtn.className = 'blue';
        editBtn.style.marginRight = '8px';
        editBtn.onclick = () => {
          document.getElementById('esrGrade').value = esr.grade;
          document.getElementById('esrNom').value = esr.nom;
          document.getElementById('esrNigend').value = esr.nigend;
          document.getElementById('esrCRT').value = esr.crt;
          state.editingEsrIndex = i;
          document.getElementById('addEsrBtn').textContent = "Enregistrer";
        };

        // bouton Supprimer
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Supprimer';
        delBtn.className = 'red';
        delBtn.onclick = () => {
          if(confirm(`Supprimer ${esr.grade} ${esr.nom} ?`)) {
            state.esrList.splice(i,1);
            populateEsrSelects();
            renderEsrList();
            debounceSave();
          }
        };

        buttons.appendChild(editBtn);
        buttons.appendChild(delBtn);
        li.appendChild(info);
        li.appendChild(buttons);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    function addEsr() {
      const grade = document.getElementById('esrGrade').value.trim();
      const nom = document.getElementById('esrNom').value.trim();
      const nigend = document.getElementById('esrNigend').value.trim();
      const crt = document.getElementById('esrCRT').value.trim();
      if(!grade || !nom || !nigend || !crt) {
        alert('Merci de remplir tous les champs ESR.');
        return;
      }

      if(state.editingEsrIndex !== null && state.editingEsrIndex !== undefined) {
        // Modification
        state.esrList[state.editingEsrIndex] = {grade, nom, nigend, crt};
        state.editingEsrIndex = null;
        document.getElementById('addEsrBtn').textContent = "Ajouter ESR";
      } else {
        // Ajout
        state.esrList.push({grade, nom, nigend, crt});
      }

      document.getElementById('esrGrade').value = '';
      document.getElementById('esrNom').value = '';
      document.getElementById('esrNigend').value = '';
      document.getElementById('esrCRT').value = '';
      populateEsrSelects();
      renderEsrList();
      debounceSave();
    }

    function delEsr() {
      if(state.esrList && state.esrList.length > 0) {
        state.esrList.pop();
        populateEsrSelects();
        renderEsrList();
        debounceSave();
      }
    }
    
    function populateEsrSelects() {
      ['cameraESR','tablette1ESR','tablette2ESR'].forEach(id => {
        const sel = document.getElementById(id);
        if(!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = '<option value="">--</option>';
        (state.esrList || []).forEach((esr) => {
          const opt = document.createElement('option');
          opt.value = `${esr.grade} ${esr.nom}`;
          opt.textContent = `${esr.grade} ${esr.nom}`;
          sel.appendChild(opt);
        });
        if([...sel.options].some(o => o.value === currentVal)) sel.value = currentVal;
        else sel.value = '';
      });
    }

    // counts
    function changeCount(type, field, action) {
      if(!state.vehicules[type]) state.vehicules[type] = 0;
      if(!state.cv[type]) state.cv[type] = 0;
      if(!state.cf[type]) state.cf[type] = 0;
      if(field === 'vehicles') {
        if(action === 'plus') state.vehicules[type]++;
        else if(action === 'minus' && state.vehicules[type] > 0) state.vehicules[type]--;
      } else if(field === 'cv') {
        if(action === 'plus') state.cv[type]++;
        else if(action === 'minus' && state.cv[type] > 0) state.cv[type]--;
      } else if(field === 'cf') {
        if(action === 'plus') state.cf[type]++;
        else if(action === 'minus' && state.cf[type] > 0) state.cf[type]--;
      }
      updateUI();
      debounceSave();
    }
    
      // CV
function addManualCv(type){
  const input = document.getElementById(type+'CvManual');
  if(!input) return;
  const val = parseInt(input.value, 10);
  if (!(val > 0)) { alert('Veuillez saisir un nombre entier > 0.'); input.focus(); input.select(); return; }
  state.cv[type] += val;
  updateUI(); debounceSave();
  input.value = '';          // ← vide
  input.placeholder = '0';   // ← indicatif
  input.blur();              // (optionnel)
}

// CF
function addManualCf(type){
  const input = document.getElementById(type+'CfManual');
  if(!input) return;
  const val = parseInt(input.value, 10);
  if (!(val > 0)) { alert('Veuillez saisir un nombre entier > 0.'); input.focus(); input.select(); return; }
  state.cf[type] += val;
  updateUI(); debounceSave();
  input.value = '';
  input.placeholder = '0';
  input.blur();
}
['train','bus','vl','pl'].forEach(t=>{
  ['Cv','Cf'].forEach(kind=>{
    const inp = document.getElementById(`${t}${kind}Manual`);
    if(!inp) return;

    // Efface 0 au focus et sélectionne la valeur existante
    inp.addEventListener('focus', () => {
      if (inp.value === '0') inp.value = '';
      if (inp.value) inp.select();
    });

    // Entrée = clic sur "Ajouter"
    const btn = document.getElementById(`${t}${kind}AddManualBtn`);
    if(btn){
      inp.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter') btn.click();
      });
    }
  });
});


    // ESI
    function renderEsiList() {
      const container = document.getElementById('esiList');
      container.innerHTML = '';
      if(!state.esiList || state.esiList.length === 0) {
        container.innerHTML = '<p>Aucun ESI ajouté.</p>';
        return;
      }
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      
      state.esiList.forEach((esi,i) => {
        const li = document.createElement('li');
        li.style.background = '#f8f9fa';
        li.style.padding = '10px';
        li.style.margin = '8px 0';
        li.style.borderRadius = '6px';
        li.style.border = '1px solid #ddd';
        
        const info = document.createElement('div');
        info.textContent = `${i+1} - ${esi.heure} - ${esi.age} - ${esi.sexe} - ${esi.ageNum} ans - ${esi.nationalite} - ${esi.lieu} - ${esi.suites}`;
        info.style.marginBottom = '8px';
        
        const buttons = document.createElement('div');

        // bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifier';
        editBtn.className = 'blue';
        editBtn.style.marginRight = '8px';
        editBtn.onclick = () => {
          document.getElementById('esiAge').value = esi.age;
          document.getElementById('esiSexe').value = esi.sexe;
          document.getElementById('esiAgeNum').value = esi.ageNum;
          document.getElementById('esiNationalite').value = esi.nationalite;
          document.getElementById('esiLieu').value = esi.lieu;
          document.getElementById('esiHeure').value = esi.heure;
          document.getElementById('esiSuites').value = esi.suites;
          state.editingEsiIndex = i;
          document.getElementById('addEsiBtn').textContent = "Enregistrer";
        };

        // bouton Supprimer
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Supprimer';
        delBtn.className = 'red';
        delBtn.onclick = () => {
          if(confirm("Supprimer cet ESI ?")) {
            state.esiList.splice(i,1);
            renderEsiList();
            debounceSave();
          }
        };

        buttons.appendChild(editBtn);
        buttons.appendChild(delBtn);
        li.appendChild(info);
        li.appendChild(buttons);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    function addEsi() {
      const heure = document.getElementById('esiHeure').value.trim();
      const age = document.getElementById('esiAge').value;
      const sexe = document.getElementById('esiSexe').value;
      const ageNum = document.getElementById('esiAgeNum').value.trim();
      const nationalite = document.getElementById('esiNationalite').value.trim();
      const lieu = document.getElementById('esiLieu').value.trim();
      const suites = document.getElementById('esiSuites').value.trim();
      if(!age || !sexe || !ageNum || !nationalite || !lieu || !suites) {
        alert('Merci de remplir tous les champs ESI.');
        return;
      }

      if(state.editingEsiIndex !== null && state.editingEsiIndex !== undefined) {
        state.esiList[state.editingEsiIndex] = {age,sexe,ageNum,nationalite,lieu,heure,suites};
        state.editingEsiIndex = null;
        document.getElementById('addEsiBtn').textContent = "Ajouter ESI";
      } else {
        state.esiList.push({age,sexe,ageNum,nationalite,lieu,heure,suites});
      }

      document.getElementById('esiAge').value = '';
      document.getElementById('esiSexe').value = '';
      document.getElementById('esiAgeNum').value = '';
      document.getElementById('esiNationalite').value = '';
      document.getElementById('esiLieu').value = '';
      document.getElementById('esiHeure').value = '';
      document.getElementById('esiSuites').value = '';
      renderEsiList();
      debounceSave();
    }

    function delEsi() {
      if(state.esiList && state.esiList.length > 0) {
        state.esiList.pop();
        renderEsiList();
        debounceSave();
      }
    }

    // PASSEUR
    function renderPasseurList() {
      const container = document.getElementById('passeurList');
      container.innerHTML = '';
      if(!state.passeurList || state.passeurList.length === 0) {
        container.innerHTML = '<p>Aucun passeur ajouté.</p>';
        return;
      }
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      ul.style.padding = '0';
      
      state.passeurList.forEach((passeur,i) => {
        const li = document.createElement('li');
        li.style.background = '#f8f9fa';
        li.style.padding = '10px';
        li.style.margin = '8px 0';
        li.style.borderRadius = '6px';
        li.style.border = '1px solid #ddd';
        
        const info = document.createElement('div');
        info.textContent = `${i+1} - ${passeur.heure} - ${passeur.age} - ${passeur.sexe} - ${passeur.ageNum} ans - ${passeur.nationalite} - ${passeur.lieu} - ${passeur.suites}`;
        info.style.marginBottom = '8px';
        
        const buttons = document.createElement('div');

        // bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifier';
        editBtn.className = 'blue';
        editBtn.style.marginRight = '8px';
        editBtn.onclick = () => {
          document.getElementById('passeurAge').value = passeur.age;
          document.getElementById('passeurSexe').value = passeur.sexe;
          document.getElementById('passeurAgeNum').value = passeur.ageNum;
          document.getElementById('passeurNationalite').value = passeur.nationalite;
          document.getElementById('passeurLieu').value = passeur.lieu;
          document.getElementById('passeurHeure').value = passeur.heure;
          document.getElementById('passeurSuites').value = passeur.suites;
          state.editingPasseurIndex = i;
          document.getElementById('addPasseurBtn').textContent = "Enregistrer";
        };

        // bouton Supprimer
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Supprimer';
        delBtn.className = 'red';
        delBtn.onclick = () => {
          if(confirm("Supprimer ce passeur ?")) {
            state.passeurList.splice(i,1);
            renderPasseurList();
            debounceSave();
          }
        };

        buttons.appendChild(editBtn);
        buttons.appendChild(delBtn);
        li.appendChild(info);
        li.appendChild(buttons);
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    function addPasseur() {
      const heure = document.getElementById('passeurHeure').value.trim();
      const age = document.getElementById('passeurAge').value;
      const sexe = document.getElementById('passeurSexe').value;
      const ageNum = document.getElementById('passeurAgeNum').value.trim();
      const nationalite = document.getElementById('passeurNationalite').value.trim();
      const lieu = document.getElementById('passeurLieu').value.trim();
      const suites = document.getElementById('passeurSuites').value.trim();
      if(!age || !sexe || !ageNum || !nationalite || !lieu || !suites) {
        alert('Merci de remplir tous les champs Passeur.');
        return;
      }

      if(state.editingPasseurIndex !== null && state.editingPasseurIndex !== undefined) {
        state.passeurList[state.editingPasseurIndex] = {age,sexe,ageNum,nationalite,lieu,heure,suites};
        state.editingPasseurIndex = null;
        document.getElementById('addPasseurBtn').textContent = "Ajouter Passeur";
      } else {
        state.passeurList.push({age,sexe,ageNum,nationalite,lieu,heure,suites});
      }

      document.getElementById('passeurAge').value = '';
      document.getElementById('passeurSexe').value = '';
      document.getElementById('passeurAgeNum').value = '';
      document.getElementById('passeurNationalite').value = '';
      document.getElementById('passeurLieu').value = '';
      document.getElementById('passeurHeure').value = '';
      document.getElementById('passeurSuites').value = '';
      renderPasseurList();
      debounceSave();
    }

    function delPasseur() {
      if(state.passeurList && state.passeurList.length > 0) {
        state.passeurList.pop();
        renderPasseurList();
        debounceSave();
      }
    }

    // Compte rendu generator (utilise state)
    function generateCompteRendu() {
      if(!state.date) { alert('Merci de sélectionner une date.'); return; }
      const site = state.site;
      const date = state.date.split('-').reverse().join('/');
      const heureDebut = state.heureDebut || '';
      const heureFin = state.heureFin || '';
      const esrCount = (state.esrList || []).length;

      let cr = `LIMES ${site} - CR - ${date} - ${heureDebut} à ${heureFin}\n\n`;

      cr += `(${esrCount}) ESR\n`;
      (state.esrList || []).forEach((esr,i) => {
        cr += `${i+1} ${esr.grade} ${esr.nom} - ${esr.nigend} - CRT ${esr.crt}\n`;
      });

      cr += `\nPorteur caméra n° ${state.cameraNum} : ${state.cameraESR || ''}\n`;
      cr += `Tablette n° T${state.tablette1Num} : ${state.tablette1ESR || ''}\n`;
      if(state.tablette2Num && state.tablette2Num.trim() !== '') {
        cr += `Tablette n° T${state.tablette2Num} : ${state.tablette2ESR || ''}\n`;
      }
      if(state.vehiculeService && state.vehiculeService.trim() !== '') {
        cr += `Véhicule de service : ${state.vehiculeService}\n`;
      }

      cr += `\n1 - MOYENS / PERSONNES:\n`;

      const typesAAfficher = siteConfig[state.site] || ['train','bus','vl','pl'];
      typesAAfficher.forEach(type => {
        const vCount = state.vehicules[type] || 0;
        const cvCount = state.cv[type] || 0;
        const cfCount = state.cf[type] || 0;
        cr += `- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${vCount} / ${cvCount} CV / ${cfCount} CF\n`;
      });

      const totalVehicules = typesAAfficher.reduce((a,t) => a + (state.vehicules[t]||0), 0);
      const totalPersonnes = typesAAfficher.reduce((a,t) => a + (state.cv[t]||0) + (state.cf[t]||0), 0);

      cr += `\nTOTAL MOYENS : ${totalVehicules}\n`;
      cr += `TOTAL PERSONNES : ${totalPersonnes}\n`;

      cr += `\n2 - ESI INTERCEPTÉ(S): ${ (state.esiList || []).length }\n`;
      (state.esiList || []).forEach((esi,i) => {
        cr += `ESI ${i+1} - ${esi.heure} - ${esi.age} - ${esi.sexe} - ${esi.ageNum} ans - ${esi.nationalite} - ${esi.lieu} - ${esi.suites}\n`;
      });

      cr += `\n3 - PASSEUR(S) INTERCEPTÉ(S): ${ (state.passeurList || []).length }\n`;
      (state.passeurList || []).forEach((passeur,i) => {
        cr += `PASSEUR ${i+1} - ${passeur.heure} - ${passeur.age} - ${passeur.sexe} - ${passeur.ageNum} ans - ${passeur.nationalite} - ${passeur.lieu} - ${passeur.suites}\n`;
      });

      cr += `\n4 - OBSERVATIONS\n${state.observations ? state.observations.trim() : '(Aucune)'}\n`;
      cr += `\n5 - DÉROULEMENT DE LA MISSION\n${state.deroulement ? state.deroulement.trim() : '(Aucun détail)'}\n`;
      if(state.pulsar === 'oui') cr += `\n6 - PULSAR fait\n`;
      else if(state.pulsar === 'non') cr += `\n6 - PULSAR non fait\n`;
      else cr += `\n6 - PULSAR (non renseigné)\n`;

      document.getElementById("compteRendu").value = cr;
autoResize(document.getElementById("compteRendu"));
    }
function autoResize(el) {
  el.style.height = "auto"; // reset
  el.style.height = (el.scrollHeight) + "px"; // adapte
}

    // Copier
    function copyToClipboard() {
      const textarea = document.getElementById('compteRendu');
      if(!textarea.value) { alert('Générez d\'abord le compte rendu.'); return; }
      try {
        navigator.clipboard.writeText(textarea.value).then(()=> alert('Compte rendu copié dans le presse-papiers !')).catch(()=> fallbackCopy(textarea));
      } catch {
        fallbackCopy(textarea);
      }
    }
    
    function fallbackCopy(textarea) {
      try {
        textarea.select();
        document.execCommand('copy');
        alert('Compte rendu copié dans le presse-papiers !');
      } catch {
        alert('Impossible de copier. Sélectionnez manuellement le texte.');
      }
    }

    function onGeneralChange() {
      state.site = document.getElementById('siteSelect').value;
      state.date = document.getElementById('dateInput').value;
      state.heureDebut = document.getElementById('heureDebutInput').value;
      state.heureFin = document.getElementById('heureFinInput').value;
      debounceSave();
    }
    
    function onMaterielChange() {
      state.cameraNum = document.getElementById('cameraNum').value.trim();
      state.cameraESR = document.getElementById('cameraESR').value;
      state.tablette1Num = document.getElementById('tablette1Num').value.trim();
      state.tablette1ESR = document.getElementById('tablette1ESR').value;
      state.tablette2Num = document.getElementById('tablette2Num').value.trim();
      state.tablette2ESR = document.getElementById('tablette2ESR').value;
      state.vehiculeService = document.getElementById('vehiculeService').value.trim();
      debounceSave();
    }
    
    function onTextAreaChange() {
      state.observations = document.getElementById('observations').value;
      state.deroulement = document.getElementById('deroulement').value;
      debounceSave();
    }

    window.onPulsarChange = function() {
      if(document.getElementById('pulsarOui') && document.getElementById('pulsarOui').checked) state.pulsar = 'oui';
      else if(document.getElementById('pulsarNon') && document.getElementById('pulsarNon').checked) state.pulsar = 'non';
      else state.pulsar = '';
      debounceSave();
    }

    // === QR features ===
state.scannedNigends = state.scannedNigends || [];
state.scansAgg = state.scansAgg || {train:{v:0,cv:0,cf:0}, bus:{v:0,cv:0,cf:0}, vl:{v:0,cv:0,cf:0}, pl:{v:0,cv:0,cf:0}};
state.resumeEsr = state.resumeEsr || '';

let html5QrCode = null;
let isScanning = false;

window.closeQrModal = async function() {
  if (html5QrCode && isScanning) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch(e) { console.warn(e); }
    isScanning = false;
  }
  document.getElementById('qrModal').style.display = 'none';
};

async function openQrModal() {
  const modal = document.getElementById('qrModal');
  const reader = document.getElementById('qr-reader');

  modal.style.display = 'flex';

  // si déjà initialisé, on le nettoie avant
  if (html5QrCode && isScanning) {
    try { await html5QrCode.stop(); } catch(e) {}
    html5QrCode.clear();
    isScanning = false;
  }

  html5QrCode = new Html5Qrcode("qr-reader");

  try {
    await html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess
    );
    isScanning = true;
  } catch (err) {
    console.error("Erreur caméra :", err);
    alert("⚠️ Impossible d’accéder à la caméra. Vérifie les permissions.");
  }
}

async function onScanSuccess(decodedText) {
  try {
    const parsed = parseQrPayload(decodedText);
    if (!parsed) return;

    const { nigend, counts, pretty } = parsed;

    if (state.scannedNigends.includes(nigend)) {
      logScan('NIGEND ' + nigend + ' déjà scanné, ignoré.');
      return;
    }

    state.scannedNigends.push(nigend);
   Object.keys(counts).forEach(k => {
  // Initialise si besoin
  if (!state.scansAgg[k]) state.scansAgg[k] = { v: 0, cv: 0, cf: 0 };

  state.scansAgg[k].v  += counts[k].v;
  state.scansAgg[k].cv += counts[k].cv;
  state.scansAgg[k].cf += counts[k].cf;
});

    const dejaEsr = (state.esrList || []).some(e => e.nigend === parsed.nigend);
    if (!dejaEsr && parsed.grade && parsed.nom && parsed.nigend && parsed.crt) {
      state.esrList.push({
        grade: parsed.grade,
        nom: parsed.nom,
        nigend: parsed.nigend,
        crt: parsed.crt
      });
      renderEsrList();
      populateEsrSelects();
      debounceSave();
    }

    state.resumeEsr += `NIGEND ${nigend}\n${pretty}\n\n`;
    updateResumeEsrUI();
    debounceSave();
    logScan('QR ajouté : ' + nigend);

    // Attente courte puis reprise du scan
    if (html5QrCode && isScanning) {
      await html5QrCode.stop();
      isScanning = false;
      setTimeout(() => {
        if (document.getElementById('qrModal').style.display !== 'none') {
          html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            onScanSuccess
          ).then(()=>{ isScanning=true; }).catch(()=>{});
        }
      }, 1000);
    }

  } catch(e) {
    console.error("Erreur décodage QR :", e);
  }
}


    function parseQrPayload(raw) {
  const lines = String(raw).split(/\n+/).map(l => l.trim()).filter(Boolean);
  let nigend = '', grade = '', nom = '', crt = '';
  const counts = {};

  lines.forEach(l => {
    if (/^NIGEND/i.test(l)) nigend = (l.split(':')[1] || '').trim();
    else if (/^GRADE/i.test(l)) grade = (l.split(':')[1] || '').trim();
    else if (/^NOM/i.test(l)) nom = (l.split(':')[1] || '').trim();
    else if (/^CRT/i.test(l)) crt = (l.split(':')[1] || '').trim();

    const m = l.match(/^(Train|Bus|Vl|Pl)\s*:\s*(\d+)\s*\/\s*(\d+)\s*CV\s*\/\s*(\d+)\s*CF/i);
    if (m) {
      const key = m[1].toLowerCase();
      counts[key] = {
        v: +m[2],
        cv: +m[3],
        cf: +m[4]
      };
    }
  });

  const prettyLines = Object.keys(counts).map(k =>
    `${k.charAt(0).toUpperCase() + k.slice(1)}: ${counts[k].v} / ${counts[k].cv} CV / ${counts[k].cf} CF`
  );

  const pretty = prettyLines.join('\n');

  return { nigend, grade, nom, crt, counts, pretty };
}

    function logScan(msg){
      const div=document.getElementById('scanLog');
      const p=document.createElement('div');
      p.textContent=msg; div.prepend(p);
    }

    function updateResumeEsrUI(){
  const resumeEl = document.getElementById('resumeEsr');
  if (resumeEl) {
    resumeEl.value = state.resumeEsr || ''; 
	autoResize(resumeEl);// Auto-redimensionnement du textarea
  }
  document.getElementById('nbScans').textContent = (state.scannedNigends||[]).length;
  document.getElementById('nigendList').textContent = (state.scannedNigends||[]).join(', ')||'—';
}

    // patch generate to include scans
    const oldGenerate = generateCompteRendu;
generateCompteRendu = function() {
  oldGenerate();

  // On récupère la config du site
  const typesAAfficher = siteConfig[state.site] || ['train','bus','vl','pl'];

  let totalVeh = 0, totalPers = 0;
  const lines = [];

  typesAAfficher.forEach(type => {
    const v  = (state.vehicules[type] || 0) + (state.scansAgg[type]?.v || 0);
    const cv = (state.cv[type] || 0) + (state.scansAgg[type]?.cv || 0);
    const cf = (state.cf[type] || 0) + (state.scansAgg[type]?.cf || 0);
    totalVeh  += v;
    totalPers += cv + cf;
    lines.push(`- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${v} / ${cv} CV / ${cf} CF`);
  });

  let cr = document.getElementById('compteRendu').value || '';
  const regex = /1 - MOYENS \/ PERSONNES:[\s\S]*?TOTAL MOYENS :.*\nTOTAL PERSONNES :.*\n/;
  const newSection = `1 - MOYENS / PERSONNES:\n${lines.join('\n')}\n\nTOTAL MOYENS : ${totalVeh}\nTOTAL PERSONNES : ${totalPers}\n`;

  if (regex.test(cr)) cr = cr.replace(regex, newSection);
  else cr += "\n" + newSection;

  document.getElementById('compteRendu').value = cr;
};

    function init() {
      loadFromStorage();
      updateUI();

      // bind events
      document.getElementById('addEsrBtn').addEventListener('click', addEsr);
      document.getElementById('delEsrBtn').addEventListener('click', delEsr);
      document.getElementById('addEsiBtn').addEventListener('click', addEsi);
      document.getElementById('delEsiBtn').addEventListener('click', delEsi);
      document.getElementById('addPasseurBtn').addEventListener('click', addPasseur);
      document.getElementById('delPasseurBtn').addEventListener('click', delPasseur);

      document.querySelectorAll('button.plusminus').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const t = e.target;
          changeCount(t.dataset.type, t.dataset.field, t.dataset.action);
        });
      });

      document.getElementById('trainCvAddManualBtn').addEventListener('click', () => addManualCv('train'));
      document.getElementById('busCvAddManualBtn').addEventListener('click', () => addManualCv('bus'));
      document.getElementById('vlCvAddManualBtn').addEventListener('click', () => addManualCv('vl'));
      document.getElementById('plCvAddManualBtn').addEventListener('click', () => addManualCv('pl'));
      document.getElementById('trainCfAddManualBtn').addEventListener('click', () => addManualCf('train'));
      document.getElementById('busCfAddManualBtn').addEventListener('click', () => addManualCf('bus'));
      document.getElementById('vlCfAddManualBtn').addEventListener('click', () => addManualCf('vl'));
      document.getElementById('plCfAddManualBtn').addEventListener('click', () => addManualCf('pl'));

      ['dateInput','heureDebutInput','heureFinInput'].forEach(id => {
        document.getElementById(id).addEventListener('input', onGeneralChange);
      });
      document.getElementById('siteSelect').addEventListener('input', () => { onGeneralChange(); updateUI(); });

      ['cameraNum','cameraESR','tablette1Num','tablette1ESR','tablette2Num','tablette2ESR','vehiculeService'].forEach(id => {
        const el=document.getElementById(id);
        if(el) el.addEventListener('input', onMaterielChange);
      });

      ['observations','deroulement'].forEach(id => {
        const el=document.getElementById(id);
        if(el) el.addEventListener('input', onTextAreaChange);
      });

      document.getElementById('generateBtn').addEventListener('click', generateCompteRendu);
      document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
      document.getElementById('resetBtn').addEventListener('click', resetData);
      document.getElementById('scanQrBtn').addEventListener('click', openQrModal);

      const pulsarOui = document.getElementById('pulsarOui');
      const pulsarNon = document.getElementById('pulsarNon');
      if(pulsarOui) pulsarOui.addEventListener('change', window.onPulsarChange);
      if(pulsarNon) pulsarNon.addEventListener('change', window.onPulsarChange);
    }

    // Initialisation au chargement de la page
    document.addEventListener('DOMContentLoaded', () => {
      showPage('homePage'); // Afficher la page d'accueil par défaut
      init();
    });

    // Service Worker pour PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker enregistré"))
        .catch(err => console.error("Erreur SW:", err));
    }
  })();
  // --------- NAVIGATION ----------
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll("nav button").forEach(btn => btn.classList.remove("active"));
  document.getElementById("btn" + id.charAt(0).toUpperCase() + id.slice(1)).classList.add("active");
}

function openPdf(url) {
  // Ouvre le PDF dans un nouvel onglet / viewer PDF du téléphone
  window.open(url, "_blank", "noopener");
}


/* ---------- BLOC JS COMPLET POUR ESI+VISA (195 pays) ---------- */
(function(){
  // 1) Liste d'environ 195 pays
  const allCountries = [
    "Afghanistan","Albanie","Algérie","Allemagne","Andorre","Angola","Antigua-et-Barbuda","Argentine","Arménie","Australie",
    "Autriche","Azerbaïdjan","Bahamas","Bahreïn","Bangladesh","Barbade","Biélorussie","Belgique","Belize","Bénin",
    "Bhoutan","Bolivie","Bosnie-Herzégovine","Botswana","Brésil","Brunei","Bulgarie","Burkina Faso","Burundi","Cabo Verde",
    "Cambodge","Cameroun","Canada","République centrafricaine","Tchad","Chili","Chine","Colombie","Comores","Congo",
    "République démocratique du Congo","Costa Rica","Côte d'Ivoire","Croatie","Cuba","Chypre","République tchèque","Danemark","Djibouti","Dominique",
    "République dominicaine","Équateur","Égypte","El Salvador","Guinée équatoriale","Érythrée","Estonie","Eswatini","Éthiopie","Fidji",
    "Finlande","France","Gabon","Gambie","Géorgie","Ghana","Grèce","Grenade","Guatemala",
    "Guinée","Guinée-Bissau","Guyana","Haïti","Honduras","Hongrie","Islande","Inde","Indonésie","Iran",
    "Irak","Irlande","Israël","Italie","Jamaïque","Japon","Jordanie","Kazakhstan","Kenya","Kiribati",
    "Koweït","Kirghizistan","Laos","Lettonie","Liban","Lesotho","Liberia","Libye","Liechtenstein","Lituanie",
    "Luxembourg","Macédoine du Nord","Madagascar","Malawi","Malaisie","Maldives","Mali","Malte","Îles Marshall","Mauritanie",
    "Maurice","Mexique","Micronésie","Moldavie","Monaco","Mongolie","Monténégro","Maroc","Mozambique","Myanmar",
    "Namibie","Nauru","Népal","Pays-Bas","Nouvelle-Zélande","Nicaragua","Niger","Nigéria","Corée du Nord","Norvège",
    "Oman","Pakistan","Palaos","Panama","Papouasie-Nouvelle-Guinée","Paraguay","Pérou","Philippines","Pologne","Portugal",
    "Qatar","Roumanie","Russie","Rwanda","Saint-Kitts-et-Nevis","Sainte-Lucie","Saint-Vincent-et-les-Grenadines","Samoa","Saint-Marin","Sao Tomé-et-Principe",
    "Arabie Saoudite","Sénégal","Serbie","Seychelles","Sierra Leone","Singapour","Slovaquie","Slovénie","Îles Salomon","Somalie",
    "Afrique du Sud","Corée du Sud","Soudan du Sud","Espagne","Sri Lanka","Soudan","Suriname","Suède","Suisse","Syrie",
    "Taïwan","Tadjikistan","Tanzanie","Thaïlande","Timor-Leste","Togo","Tonga","Trinité-et-Tobago","Tunisie","Turquie",
    "Turkménistan","Tuvalu","Ouganda","Ukraine","Émirats arabes unis","Royaume-Uni","États-Unis","Uruguay","Ouzbékistan","Vanuatu",
    "Vatican","Venezuela","Vietnam","Yémen","Zambie","Zimbabwe","Kosovo"
  ];

  // 2) Pays sans visa court ni long
  const neverNeed = [
    "Autriche","Belgique","Bulgarie","Chypre","République tchèque","Croatie","Danemark","Estonie","Finlande","France",
    "Allemagne","Grèce","Hongrie","Irlande","Italie","Lettonie","Lituanie","Luxembourg","Malte","Pays-Bas",
    "Pologne","Portugal","Roumanie","Slovaquie","Slovénie","Espagne","Suède",
    "Islande","Liechtenstein","Norvège","Suisse","Monaco","Andorre","Saint-Marin","Vatican"
  ];

  // 3) Pays exemptés de visa court séjour
  const shortExempt = [
    "Albanie","Bosnie-Herzégovine","Monténégro","Macédoine du Nord","Serbie","Moldavie","Ukraine","Géorgie",
    "Argentine","Bahamas","Barbade","Bolivie","Brésil","Canada","Chili","Colombie","Costa Rica",
    "Dominique","Équateur","El Salvador","Grenade","Guatemala","Guyana","Honduras","Jamaïque","Mexique",
    "Nicaragua","Panama","Paraguay","Pérou","Suriname","Trinité-et-Tobago","Uruguay","Venezuela",
    "Australie","Brunei","Japon","Malaisie","Nouvelle-Zélande","Singapour","Corée du Sud","Israël","Taïwan",
    "Émirats arabes unis","Kiribati","Îles Marshall","Micronésie","Nauru","Palaos","Samoa","Îles Salomon","Tonga","Tuvalu","Vanuatu",
    "Maurice","Seychelles","États-Unis"
  ];

  // 4) Construction de visaData
  const visaData = { court: {}, long: {} };
  allCountries.forEach(country => {
    if (neverNeed.includes(country)) {
      visaData.court[country] = false;
      visaData.long[country] = false;
    } else if (shortExempt.includes(country)) {
      visaData.court[country] = false;
      visaData.long[country] = true;
    } else {
      visaData.court[country] = true;
      visaData.long[country] = true;
    }
  });

  // 5) Pays avec exemption biométrique
  const biometricExemptions = ["Albanie","Bosnie-Herzégovine","Macédoine du Nord","Monténégro","Serbie","Moldavie","Ukraine","Géorgie"];

  // 6) Système d'autocomplétion
  let selectedCountry = '';
  let currentSelection = -1;
  const paysInput = document.getElementById('paysInput');
  const paysDropdown = document.getElementById('paysDropdown');
  
  const sortedCountries = allCountries.slice().sort((a,b) => a.localeCompare(b, 'fr', {ignorePunctuation: true}));

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[-\s]/g, ''); // Supprime tirets et espaces
  }

  function filterCountries(searchTerm) {
    const normalizedSearch = normalizeText(searchTerm);
    return sortedCountries.filter(country => 
      normalizeText(country).includes(normalizedSearch)
    ).slice(0, 10);
  }

  function showDropdown(countries) {
    paysDropdown.innerHTML = '';
    if (countries.length === 0) {
      paysDropdown.style.display = 'none';
      return;
    }
    
    countries.forEach((country, index) => {
      const option = document.createElement('div');
      option.className = 'pays-option';
      option.textContent = country;
      option.addEventListener('click', () => selectCountry(country));
      paysDropdown.appendChild(option);
    });
    
    paysDropdown.style.display = 'block';
    currentSelection = -1;
  }

  function selectCountry(country) {
    selectedCountry = country;
    paysInput.value = country;
    paysDropdown.style.display = 'none';
    checkVisa(); // Vérification automatique
  }

  function hideDropdown() {
    setTimeout(() => {
      paysDropdown.style.display = 'none';
    }, 200);
  }

  function updateSelection(direction) {
    const options = paysDropdown.querySelectorAll('.pays-option');
    if (options.length === 0) return;
    
    if (currentSelection >= 0) {
      options[currentSelection].classList.remove('selected');
    }
    
    currentSelection += direction;
    if (currentSelection < 0) currentSelection = options.length - 1;
    if (currentSelection >= options.length) currentSelection = 0;
    
    options[currentSelection].classList.add('selected');
    options[currentSelection].scrollIntoView({ block: 'nearest' });
  }

  // Fonction de vérification automatique
  function checkVisa() {
    const pays = selectedCountry || paysInput.value.trim();
    const duree = document.getElementById('duree').value;
    const resultat = document.getElementById('resultat');
    
    if (!pays || !allCountries.includes(pays)) {
      resultat.innerHTML = '';
      return;
    }
    
    const needsVisa = visaData[duree][pays];
    let html = '';
    
    if (needsVisa) {
      html = `<span style="color: #cc0000;">Visa requis</span> pour ce séjour (${duree === 'court' ? 'court (<90j)' : 'long (>90j)'}). ` +
             `Voir la procédure sur <a href="https://france-visas.gouv.fr/web/france-visas/assistant-visa" target="_blank" rel="noopener">France-Visas</a>.`;
    } else {
      html = `<span style="color: #008000;">Pas de visa requis</span> pour ce séjour (${duree === 'court' ? 'court (<90j)' : 'long (>90j)'}). ` +
             `Vérifier conditions particulières sur <a href="https://france-visas.gouv.fr/web/france-visas/assistant-visa" target="_blank" rel="noopener">France-Visas</a>.`;
    }

    if (!needsVisa && duree === 'court' && biometricExemptions.includes(pays)) {
      html += ` <br><small>Note : l'exemption peut demander un passeport biométrique.</small>`;
    }
    
    resultat.innerHTML = html;
  }

  // Event listeners
  paysInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();
    selectedCountry = '';
    
    if (searchTerm.length === 0) {
      paysDropdown.style.display = 'none';
      document.getElementById('resultat').innerHTML = '';
      return;
    }
    
    const filtered = filterCountries(searchTerm);
    showDropdown(filtered);
  });

  paysInput.addEventListener('keydown', (e) => {
    const dropdown = paysDropdown;
    const options = dropdown.querySelectorAll('.pays-option');
    
    if (dropdown.style.display === 'none' || options.length === 0) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        updateSelection(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        updateSelection(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (currentSelection >= 0) {
          selectCountry(options[currentSelection].textContent);
        }
        break;
      case 'Escape':
        paysDropdown.style.display = 'none';
        break;
    }
  });

  paysInput.addEventListener('blur', hideDropdown);
  paysInput.addEventListener('focus', (e) => {
    if (e.target.value.trim()) {
      const filtered = filterCountries(e.target.value);
      showDropdown(filtered);
    }
  });

  // Event listener pour le changement de durée
  document.getElementById('duree').addEventListener('change', checkVisa);

  // Fonction globale pour rétrocompatibilité (au cas où)
  window.verifierVisa = checkVisa;

  window._esiVisaData = { allCountries, neverNeed, shortExempt, visaData, biometricExemptions };
  console.debug("ESI+Visa: visaData initialisé pour", allCountries.length, "pays. Voir window._esiVisaData.");
})();
	function computeStatut(age, sexe) {
  if (isNaN(age) || !sexe) return "";
  if (age >= 18) return (sexe === "Femme") ? "Majeure" : "Majeur";
  return (sexe === "Femme") ? "Mineure" : "Mineur";
}

function majEsiStatut() {
  const age = parseInt(document.getElementById("esiAgeNum").value, 10);
  const sexe = document.getElementById("esiSexe").value;
  const champStatut = document.getElementById("esiAge");

  champStatut.value = computeStatut(age, sexe);
}

// on "écoute" les 2 champs en même temps
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("esiAgeNum").addEventListener("input", majEsiStatut);
  document.getElementById("esiSexe").addEventListener("change", majEsiStatut);
});
	function computePasseurStatut(age, sexe) {
  if (isNaN(age) || !sexe) return "";
  if (age >= 18) return (sexe === "Femme") ? "Majeure" : "Majeur";
  return (sexe === "Femme") ? "Mineure" : "Mineur";
}

function majPasseurStatut() {
  const age = parseInt(document.getElementById("passeurAgeNum").value, 10);
  const sexe = document.getElementById("passeurSexe").value;
  const champStatut = document.getElementById("passeurAge");

  champStatut.value = computePasseurStatut(age, sexe);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("passeurAgeNum").addEventListener("input", majPasseurStatut);
  document.getElementById("passeurSexe").addEventListener("change", majPasseurStatut);
});
// Reset qui conserve le premier ESR mais réinitialise aussi le site
function resetData() {
  if (confirm("Voulez-vous vraiment effacer toutes les données sauf le premier ESR ?")) {
    
    // Charger l'état actuel depuis le localStorage
    const data = localStorage.getItem('borderforce');
    let premierEsr = null;
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.esrList && parsed.esrList.length > 0) {
        premierEsr = parsed.esrList[0]; // on garde le 1er ESR
      }
    }

    // Nouveau state réinitialisé
    const newState = {
      site: '',   // <= le site est vidé
      date: '',
      heureDebut: '',
      heureFin: '',
      esrList: [],
      cameraNum: '',
      cameraESR: '',
      tablette1Num: '',
      tablette1ESR: '',
      tablette2Num: '',
      tablette2ESR: '',
      vehiculeService: '',
      vehicules: { train: 0, bus: 0, vl: 0, pl: 0 },
      cv: { train: 0, bus: 0, vl: 0, pl: 0 },
      cf: { train: 0, bus: 0, vl: 0, pl: 0 },
      esiList: [],
      passeurList: [],
      observations: '',
      deroulement: '',
      pulsar: '',
      editingEsrIndex: null,
      editingEsiIndex: null,
      editingPasseurIndex: null,
      resumeEsr: '',
      scannedNigends: []
    };

    // On remet le premier ESR s’il existait
    if (premierEsr) {
      newState.esrList.push(premierEsr);
    }

    // Sauvegarde et rechargement
    localStorage.setItem('borderforce', JSON.stringify(newState));
    location.reload();

    alert("Données effacées. Le premier ESR a été conservé.");
  }
}

function confirmCallCORG() {
  const popup = document.getElementById('popupCORG');
  const callBtn = document.getElementById('popupCallBtn');
  const cancelBtn = document.getElementById('popupCancelBtn');

  popup.style.display = 'flex';

  callBtn.onclick = () => {
    popup.style.display = 'none';
    window.location.href = 'tel:0493182361';
  };

  cancelBtn.onclick = () => {
    popup.style.display = 'none';
  };
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(registration => {
    // 🔍 Détection des mises à jour du SW
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 🆕 Nouvelle version détectée
          if (confirm("🆕 Nouvelle version disponible — Recharger maintenant ?")) {
            newWorker.postMessage({ action: 'skipWaiting' });
            window.location.reload();
          }
        }
      });
    });
  });

  // 💬 Réception du message 'skipWaiting' depuis le SW
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('✅ Nouvelle version du service worker activée.');
  });
}


function formatHeureHhmm(heureValue){
  if(!heureValue) return "";
  const [h, m] = heureValue.split(":");
  return `${parseInt(h,10)}h${m}`;
}
function plural(nb, s, p){
  const n = Number(nb);
  return (n === 1) ? s : p;
}
function buildSuffixComptage(nbCtrl, nbDesc){
  const parts = [];
  const n1 = nbCtrl === "" ? NaN : parseInt(nbCtrl, 10);
  const n2 = nbDesc === "" ? NaN : parseInt(nbDesc, 10);
  if(!Number.isNaN(n1)) parts.push(`${n1} ${plural(n1,"personne contrôlée","personnes contrôlées")}`);
  if(!Number.isNaN(n2)) parts.push(`${n2} ${plural(n2,"descendu","descendus")}`);
  return parts.length ? " — " + parts.join(", ") : "";
}
function triJoin(parts){ return parts.filter(Boolean).join(" — "); }

function majAffichageComptage(){
  const action = (document.getElementById("type_action").value || "").toLowerCase();
  const libre  = (document.getElementById("texte_libre").value || "").toLowerCase();
  // ✅ Affiche les champs de comptage pour "bus" ou "train"
  const show = action.includes("bus") || libre.includes("bus") || action.includes("train") || libre.includes("train");
  const bloc = document.getElementById("bloc_comptage");
  if(bloc) bloc.style.display = show ? "block" : "none";
}

function ajouterDeroulementFlex(){
  const zone = document.getElementById("deroulement");
  if(!zone){ alert("⚠️ Zone 'Déroulement' introuvable."); return; }

  const heure = document.getElementById("heure_action").value;
  const esi   = (document.getElementById("esi_select").value || "").trim();
  const act   = (document.getElementById("type_action").value || "").trim();
  const libre = (document.getElementById("texte_libre").value || "").trim();
  const nbCtrl = document.getElementById("nb_controles").value;
  const nbDesc = document.getElementById("nb_descendus").value;

  const hStr = formatHeureHhmm(heure);
  const corps = triJoin([esi, act, libre]);
  const suffix = buildSuffixComptage(nbCtrl, nbDesc);

  if(!hStr && !corps && !suffix){
    alert("Renseigne au moins l’heure ou une action (ESI, prédéfinie ou texte libre).");
    return;
  }

  const ligne = triJoin([hStr, corps]) + suffix;

  zone.value = zone.value.trim() ? (zone.value + "\n" + ligne) : ligne;
  zone.dispatchEvent(new Event('input')); // garde ton auto-redimensionnement

  document.getElementById("heure_action").value = "";
  document.getElementById("esi_select").value = "";
  document.getElementById("type_action").value = "";
  document.getElementById("texte_libre").value = "";
  document.getElementById("nb_controles").value = "";
  document.getElementById("nb_descendus").value = "";

  majAffichageComptage();
}
      

const NATIONALITES = [
  "Afghane","Albanaise","Algérienne","Allemande","Américaine","Andorrane","Angolaise","Argentine",
  "Arménienne","Australienne","Autrichienne","Azerbaïdjanaise",
  "Belge","Béninoise","Biélorusse","Bolivienne","Bosnienne","Botswanaise","Brésilienne","Britannique","Bulgare","Burkinabè","Burundaise",
  "Cambodgienne","Camerounaise","Canadienne","Cap-verdienne","Centrafricaine","Chilienne","Chinoise","Colombienne","Comorienne","Congolaise",
  "Croate","Cubaine","Chypriote","Tchèque",
  "Danoise","Djiboutienne","Dominicaine","Dominiquaise",
  "Égyptienne","Émirienne","Équatorienne","Érythréenne","Espagnole","Estonienne","Éthiopienne",
  "Finlandaise","Française",
  "Gabonaise","Gambienne","Géorgienne","Ghanéenne","Grecque","Guatémaltèque","Guinéenne","Guinéenne-Bissau","Guyanaise",
  "Haïtienne","Hondurienne","Hongroise",
  "Indienne","Indonésienne","Irakienne","Iranienne","Irlandaise","Islandaise","Israélienne","Italienne",
  "Ivoirienne",
  "Japonaise","Jordanienne",
  "Kazakhstanaise","Kenyane","Kirghize","Kosovare","Koweïtienne",
  "Laotienne","Libanaise","Libérienne","Libyenne","Liechtensteinoise","Lituanienne","Luxembourgeoise",
  "Macédonienne","Malagasy","Malaisienne","Malawienne","Malienne","Maltaise","Marocaine","Mauricienne","Mauritanienne","Mexicaine",
  "Moldave","Monégasque","Mongole","Monténégrine","Mozambicaine",
  "Namibienne","Néerlandaise","Néo-zélandaise","Népalaise","Nigériane","Nigérienne","Nord-coréenne","Norvégienne",
  "Omanaise",
  "Pakistanaise","Palestinienne","Panaméenne","Paraguayenne","Péruvienne","Philippine","Polonaise","Portugaise",
  "Qatarienne",
  "Roumaine","Russe","Rwandaise",
  "Saoudienne","Sénégalaise","Serbe","Singapourienne","Slovaque","Slovène","Somalienne","Soudanaise","Sri-lankaise",
  "Sud-africaine","Sud-coréenne","Sud-soudanaise","Suédoise","Suisse","Syrienne",
  "Tadjike","Tanzanienne","Tchadienne","Thaïlandaise","Togolaise","Tunisienne","Turque",
  "Ukrainienne","Uruguayenne","Uzbekistanaise",
  "Vénézuélienne","Vietnamienne",
  "Yéménite",
  "Zambienne","Zimbabwéenne"
];

function attachNatAutocomplete(input) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nat-wrapper';
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  const list = document.createElement('div');
  list.className = 'nat-list';
  list.style.display = 'none';
  wrapper.appendChild(list);

  // Normalisation : minuscules + suppression accents + trim
  const normalize = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  input.addEventListener('input', () => {
    const search = normalize(input.value);
    list.innerHTML = '';

    if (!search) {
      list.style.display = 'none';
      return;
    }

    // Prépare une liste [label + version normalisée]
    const matches = NATIONALITES
      .map(label => ({
        label,
        norm: normalize(label)
      }))
      // garde celles qui CONTIENNENT le texte tapé
      .filter(item => item.norm.includes(search))
      // priorité à celles qui COMMENCENT par ce que tu tapes
      .sort((a, b) => {
        const aStarts = a.norm.startsWith(search);
        const bStarts = b.norm.startsWith(search);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.label.localeCompare(b.label);
      })
      .slice(0, 20);

    if (!matches.length) {
      list.style.display = 'none';
      return;
    }

    matches.forEach(item => {
      const div = document.createElement('div');
      div.className = 'nat-item';
      div.textContent = item.label;
      div.addEventListener('click', () => {
        input.value = item.label;
        list.innerHTML = '';
        list.style.display = 'none';
      });
      list.appendChild(div);
    });

    list.style.display = 'block';
  });

  // ferme si clic à l'extérieur
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      list.style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nat-autocomplete').forEach(attachNatAutocomplete);
});

// Format automatique JJ/MM/AAAA
function formatDOB(input) {
  let numbers = input.value.replace(/\D/g, ''); // garde que les chiffres
  if (numbers.length >= 5) {
    input.value = numbers.slice(0, 2) + "/" + numbers.slice(2, 4) + "/" + numbers.slice(4, 8);
  } else if (numbers.length >= 3) {
    input.value = numbers.slice(0, 2) + "/" + numbers.slice(2, 4);
  } else {
    input.value = numbers;
  }

  updateAgeFromDOB();
}

// Calcul de l'âge et mise à jour du champ
function updateAgeFromDOB() {
  const dob = document.getElementById("esiDob").value;
  const ageNum = document.getElementById("esiAgeNum");

  const age = calculateAge(dob);
  if (age !== null) {
    ageNum.value = age;
    majEsiStatut(); // Simule une saisie utilisateur
  }
}

// Calcule l'âge en fonction de la date de naissance
function calculateAge(dob) {
  if (!dob || dob.length !== 10) return null;
  const [day, month, year] = dob.split("/");
  const birthDate = new Date(`${year}-${month}-${day}`);
  if (isNaN(birthDate)) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}