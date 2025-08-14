import { ligacoes } from './utils.js';

let circuitCount = 0;

// --- CONTROLE DE VISIBILIDADE E MODAIS ---
export function showLoginView() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('appContainer').style.display = 'none';
}

export function showAppView(userProfile) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    const isAdmin = userProfile?.is_admin || false;
    document.getElementById('adminPanelBtn').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('manageProjectsBtn').style.display = isAdmin ? 'block' : 'none';
}

export function openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
export function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }


// --- MANIPULAÇÃO DO FORMULÁRIO PRINCIPAL E CIRCUITOS ---
export function resetForm(addFirst = true) {
    document.getElementById('main-form').reset();
    document.getElementById('tech-form').reset();
    document.getElementById('currentProjectId').value = '';
    document.getElementById('circuits-container').innerHTML = '';
    document.getElementById('report').textContent = 'O relatório aparecerá aqui.';
    document.getElementById('searchInput').value = '';
    circuitCount = 0;
    if (addFirst) addCircuit();
}

export function addCircuit() {
    circuitCount++;
    const newCircuitDiv = document.createElement('div');
    newCircuitDiv.innerHTML = getCircuitHTML(circuitCount);
    document.getElementById('circuits-container').appendChild(newCircuitDiv.firstElementChild);
    initializeCircuitListeners(circuitCount);
}

export function removeCircuit(id) {
    document.getElementById(`circuit-${id}`)?.remove();
    renumberCircuits();
}

function renumberCircuits() {
    const circuitBlocks = document.querySelectorAll('.circuit-block');
    circuitCount = circuitBlocks.length;
    circuitBlocks.forEach((block, index) => {
        const newId = index + 1;
        const oldId = parseInt(block.dataset.id);
        if (oldId === newId) return;
        block.dataset.id = newId;
        block.id = `circuit-${newId}`;
        block.querySelectorAll('[id],[for],[data-circuit-id]').forEach(el => {
            for (const prop of ['id', 'htmlFor', 'dataset.circuitId']) {
                const value = prop === 'dataset.circuitId' ? el.dataset.circuitId : el[prop];
                if (value && String(value).includes(`-${oldId}`)) {
                    const newValue = value.replace(`-${oldId}`, `-${newId}`);
                    if (prop === 'dataset.circuitId') {
                        el.dataset.circuitId = newValue;
                    } else {
                        el[prop] = newValue;
                    }
                }
            }
        });
        block.querySelector('h2').textContent = `Circuito ${newId}`;
    });
}

function initializeCircuitListeners(id) {
    const tipoCircuito = document.getElementById(`tipoCircuito-${id}`);
    const fases = document.getElementById(`fases-${id}`);
    const tipoLigacao = document.getElementById(`tipoLigacao-${id}`);
    const potenciaWGroup = document.getElementById(`potenciaW_group-${id}`);
    const potenciaCVGroup = document.getElementById(`potenciaCV_group-${id}`);

    const atualizarLigacoes = () => {
        const faseSelecionada = fases.value;
        const ligacoesDisponiveis = ligacoes[faseSelecionada] || [];
        tipoLigacao.innerHTML = '';
        ligacoesDisponiveis.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            tipoLigacao.appendChild(option);
        });
    };

    tipoCircuito.addEventListener('change', () => {
        potenciaWGroup.classList.toggle('hidden', tipoCircuito.value === 'motores');
        potenciaCVGroup.classList.toggle('hidden', tipoCircuito.value !== 'motores');
    });

    fases.addEventListener('change', atualizarLigacoes);
    atualizarLigacoes();
}

function getCircuitHTML(id) {
    return `<div class="circuit-block" id="circuit-${id}" data-id="${id}"><div class="circuit-header"><h2 id="circuit-title-${id}">Circuito ${id}</h2>${id > 1 ? `<button type="button" class="remove-btn" data-circuit-id="${id}">Remover</button>` : ''}</div><div class="form-grid"><div class="form-group"><label for="nomeCircuito-${id}">Nome do Circuito</label><input type="text" id="nomeCircuito-${id}" value="Circuito ${id}"></div><div class="form-group"><label for="tipoCircuito-${id}">Tipo de Circuito</label><select id="tipoCircuito-${id}"><option value="alimentacao_geral">Alimentacao Geral</option><option value="iluminacao">Iluminacao</option><option value="tug" selected>Tomadas de Uso Geral (TUG)</option><option value="tue">Tomadas de Uso Especifico (TUE)</option><option value="aquecimento">Aquecimento</option><option value="motores">Circuito de Motores</option><option value="ar_condicionado">Ar Condicionado</option></select></div><div class="form-group" id="potenciaW_group-${id}"><label for="potenciaW-${id}">Potencia (W)</label><input type="number" id="potenciaW-${id}" value="2500"></div><div class="form-group hidden" id="potenciaCV_group-${id}"><label for="potenciaCV-${id}">Potencia do Motor (CV)</label><select id="potenciaCV-${id}"><option value="0.25">1/4</option><option value="0.5">1/2</option><option value="1">1</option><option value="2">2</option><option value="5">5</option><option value="10">10</option></select></div><div class="form-group"><label for="fatorDemanda-${id}">Fator de Demanda</label><select id="fatorDemanda-${id}"><option value="1" selected>1.00</option><option value="0.9">0.90</option><option value="0.8">0.80</option><option value="0.7">0.70</option></select></div><div class="form-group"><label for="fases-${id}">Sistema de Fases</label><select id="fases-${id}"><option value="Monofasico" selected>Monofasico</option><option value="Bifasico">Bifasico</option><option value="Trifasico">Trifasico</option></select></div><div class="form-group"><label for="tipoLigacao-${id}">Tipo de Ligacao</label><select id="tipoLigacao-${id}"></select></div><div class="form-group"><label for="tensaoV-${id}">Tensao (V)</label><select id="tensaoV-${id}"><option value="127">127 V</option><option value="220" selected>220 V</option><option value="380">380 V</option></select></div><div class="form-group"><label for="fatorPotencia-${id}">Fator de Potencia</label><input type="number" id="fatorPotencia-${id}" step="0.01" value="0.92"></div><div class="form-group"><label for="comprimentoM-${id}">Comprimento (m)</label><input type="number" id="comprimentoM-${id}" value="20"></div><div class="form-group"><label for="tipoIsolacao-${id}">Tipo de Isolacao</label><select id="tipoIsolacao-${id}"><option value="PVC" selected>PVC 70 C</option><option value="EPR">EPR/XLPE 90 C</option></select></div><div class="form-group"><label for="materialCabo-${id}">Material do Condutor</label><select id="materialCabo-${id}"><option value="Cobre" selected>Cobre</option><option value="Aluminio">Aluminio</option></select></div><div class="form-group"><label for="metodoInstalacao-${id}">Metodo de Instalacao</label><select id="metodoInstalacao-${id}"><option value="A1">A1</option><option value="A2">A2</option><option value="B1" selected>B1</option><option value="B2">B2</option><option value="C">C</option><option value="D">D</option></select></div><div class="form-group"><label for="temperaturaAmbienteC-${id}">Temp. Ambiente (C)</label><select id="temperaturaAmbienteC-${id}"><option value="30" selected>30</option><option value="40">40</option><option value="50">50</option></select></div><div class="form-group"><label for="resistividadeSolo-${id}">Resist. Solo (C.m/W)</label><select id="resistividadeSolo-${id}"><option value="0" selected>N/A</option><option value="2.5">2.5</option></select></div><div class="form-group"><label for="numCircuitosAgrupados-${id}">N Circuitos Agrupados</label><input type="number" id="numCircuitosAgrupados-${id}" value="1"></div><div class="form-group"><label for="limiteQuedaTensao-${id}">Limite Queda de Tensao (%)</label><input type="number" id="limiteQuedaTensao-${id}" step="0.1" value="4.0"></div><div class="form-group"><label for="tipoDisjuntor-${id}">Tipo de Disjuntor</label><select id="tipoDisjuntor-${id}"><option>Minidisjuntor (DIN)</option><option>Caixa Moldada (MCCB)</option></select></div><div class="form-group"><label for="classeDPS-${id}">Protecao DPS</label><select id="classeDPS-${id}"><option>Nenhuma</option><option>Classe I</option><option>Classe II</option><option>Classe III</option></select><div class="checkbox-group"><input type="checkbox" id="requerDR-${id}"><label for="requerDR-${id}">Requer DR</label></div></div></div></div>`;
}

// --- PREENCHIMENTO DE DADOS ---
export function populateProjectList(projects, isAdmin) {
    const select = document.getElementById('savedProjectsSelect');
    select.innerHTML = '<option value="">-- Selecione uma obra --</option>';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        let text = project.project_name;
        if (isAdmin && project.profiles) {
            text += ` (${project.profiles.nome})`;
        }
        option.textContent = text;
        select.appendChild(option);
    });
}

export function populateFormWithProjectData(project) {
    document.getElementById('currentProjectId').value = project.id;
    Object.keys(project.main_data).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = project.main_data[id];
    });
    Object.keys(project.tech_data).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = project.tech_data[id];
    });
    document.getElementById('circuits-container').innerHTML = '';
    circuitCount = 0;
    project.circuits_data.forEach(savedCircuitData => {
        addCircuit();
        const currentId = circuitCount;
        Object.keys(savedCircuitData).forEach(savedId => {
            if (savedId === 'id') return;
            const newId = savedId.replace(`-${savedCircuitData.id}`, `-${currentId}`);
            const element = document.getElementById(newId);
            if (element) {
                if (element.type === 'checkbox') element.checked = savedCircuitData[savedId];
                else element.value = savedCircuitData[savedId];
            }
        });
        document.getElementById(`fases-${currentId}`).dispatchEvent(new Event('change'));
        document.getElementById(`tipoLigacao-${currentId}`).value = savedCircuitData[`tipoLigacao-${savedCircuitData.id}`];
        document.getElementById(`tipoCircuito-${currentId}`).dispatchEvent(new Event('change'));
    });
}

// --- PAINEL DE ADMINISTRAÇÃO ---
export function populateUsersPanel(users) {
    const userList = document.getElementById('adminUserList');
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        let actions = '';
        if (!user.is_admin) {
            if (user.is_approved) {
                actions = `<button class="edit-user-btn" data-user-id="${user.id}">Editar</button>
                           <button class="remove-user-btn" data-user-id="${user.id}">Remover</button>`;
            } else {
                actions = `<button class="approve-user-btn" data-user-id="${user.id}">Aprovar</button>`;
            }
        }
        li.innerHTML = `<span>${user.nome || user.email} ${user.is_admin ? '(Admin)' : (user.is_approved ? '' : '(Pendente)')}</span><div class="admin-user-actions">${actions}</div>`;
        userList.appendChild(li);
    });
}

export function populateEditUserModal(userData) {
    document.getElementById('editUserId').value = userData.id;
    document.getElementById('editNome').value = userData.nome || '';
    document.getElementById('editCpf').value = userData.cpf || '';
    document.getElementById('editTelefone').value = userData.telefone || '';
    document.getElementById('editEmail').value = userData.email || '';
    document.getElementById('editCrea').value = userData.crea || '';
    openModal('editUserModalOverlay');
}

export function populateProjectsPanel_Admin(projects, users) {
    const tableBody = document.getElementById('adminProjectsTableBody');
    tableBody.innerHTML = '';
    projects.forEach(project => {
        const row = document.createElement('tr');
        const userOptions = users.map(user => `<option value="${user.id}" ${user.id === project.owner_id ? 'selected' : ''}>${user.nome}</option>`).join('');
        row.innerHTML = `
            <td>${project.project_name}</td>
            <td>${project.profiles?.nome || 'Desconhecido'}</td>
            <td>
                <select>${userOptions}</select>
                <button class="transfer-btn" data-project-id="${project.id}">Transferir</button>
            </td>`;
        tableBody.appendChild(row);
    });
}

// --- RELATÓRIOS E PDF ---
export function renderReport(results) {
    // Esta função é uma versão simplificada da sua original para este arquivo
    // A lógica completa de formatação do texto pode ser adicionada aqui
    document.getElementById('report').textContent = JSON.stringify(results, null, 2);
}

export function generatePdf(results, currentUserProfile) {
    if (!results) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Simplificado - a lógica completa de criação do PDF pode ser inserida aqui
    doc.text("Relatório de Projeto Elétrico", 10, 10);
    doc.text(`Gerado por: ${currentUserProfile.nome}`, 10, 20);
    
    const head = [['Ckt', 'Nome', 'Pot.(W)', 'Cabo', 'Disjuntor']];
    const body = results.map(r => [
        r.dados.id,
        r.dados.nomeCircuito,
        r.calculos.potenciaDemandada.toFixed(2),
        r.calculos.bitolaRecomendadaMm2 + 'mm²',
        r.calculos.disjuntorRecomendado.nome
    ]);

    doc.autoTable({ startY: 30, head, body });
    doc.save(`Relatorio_${results[0].dados.obra || 'Projeto'}.pdf`);
}