// Arquivo: ui.js

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
            const props=['id','htmlFor','data-circuit-id'];
            props.forEach(prop=>{
                if(el[prop] && String(el[prop]).includes(`-${oldId}`)){
                    el[prop] = el[prop].replace(`-${oldId}`,`-${newId}`)
                }
            })
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

function getCircuitHTML(id){
    return `<div class="circuit-block" id="circuit-${id}" data-id="${id}"><div class="circuit-header"><h2 id="circuit-title-${id}">Circuito ${id}</h2>${id>1?`<button type="button" class="remove-btn" data-circuit-id="${id}">Remover</button>`:''}</div><div class="form-grid"><div class="form-group"><label for="nomeCircuito-${id}">Nome do Circuito</label><input type="text" id="nomeCircuito-${id}" value="Circuito ${id}"></div><div class="form-group"><label for="tipoCircuito-${id}">Tipo de Circuito</label><select id="tipoCircuito-${id}"><option value="alimentacao_geral">Alimentacao Geral</option><option value="iluminacao">Iluminacao</option><option value="tug" selected>Tomadas de Uso Geral (TUG)</option><option value="tue">Tomadas de Uso Especifico (TUE)</option><option value="aquecimento">Aquecimento</option><option value="motores">Circuito de Motores</option><option value="ar_condicionado">Ar Condicionado</option></select></div><div class="form-group" id="potenciaW_group-${id}"><label for="potenciaW-${id}">Potencia (W)</label><input type="number" id="potenciaW-${id}" value="2500"></div><div class="form-group hidden" id="potenciaCV_group-${id}"><label for="potenciaCV-${id}">Potencia do Motor (CV)</label><select id="potenciaCV-${id}"><option value="0.25">1/4</option><option value="0.33">1/3</option><option value="0.5">1/2</option><option value="0.75">3/4</option><option value="1">1</option><option value="1.5">1 1/2</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="7.5">7 1/2</option><option value="10">10</option><option value="12.5">12 1/2</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option></select></div><div class="form-group"><label for="fatorDemanda-${id}">Fator de Demanda</label><select id="fatorDemanda-${id}"><option value="0.50">0.50</option><option value="0.55">0.55</option><option value="0.60">0.60</option><option value="0.65">0.65</option><option value="0.70">0.70</option><option value="0.75">0.75</option><option value="0.80">0.80</option><option value="0.85">0.85</option><option value="0.90">0.90</option><option value="0.92">0.92</option><option value="0.95">0.95</option><option value="1" selected>1.00</option><option value="1.10">1.10</option><option value="1.15">1.15</option><option value="1.20">1.20</option><option value="1.25">1.25</option><option value="1.30">1.30</option></select></div><div class="form-group"><label for="fases-${id}">Sistema de Fases</label><select id="fases-${id}"><option value="Monofasico" selected>Monofasico</option><option value="Bifasico">Bifasico</option><option value="Trifasico">Trifasico</option></select></div><div class="form-group"><label for="tipoLigacao-${id}">Tipo de Ligacao</label><select id="tipoLigacao-${id}"></select></div><div class="form-group"><label for="tensaoV-${id}">Tensao (V)</label><select id="tensaoV-${id}"><option value="12">12 V</option><option value="24">24 V</option><option value="36">36 V</option><option value="127">127 V</option><option value="220" selected>220 V</option><option value="380">380 V</option><option value="440">440 V</option><option value="760">760 V</option></select></div><div class="form-group"><label for="fatorPotencia-${id}">Fator de Potencia (eficiencia)</label><input type="number" id="fatorPotencia-${id}" step="0.01" value="0.92"></div><div class="form-group"><label for="comprimentoM-${id}">Comprimento (m)</label><input type="number" id="comprimentoM-${id}" value="20"></div><div class="form-group"><label for="tipoIsolacao-${id}">Tipo de Isolacao</label><select id="tipoIsolacao-${id}"><option value="PVC" selected>PVC 70 C</option><option value="EPR">EPR/XLPE 90 C</option></select></div><div class="form-group"><label for="materialCabo-${id}">Material do Condutor</label><select id="materialCabo-${id}"><option value="Cobre" selected>Cobre</option><option value="Aluminio">Aluminio</option></select></div><div class="form-group"><label for="metodoInstalacao-${id}">Metodo de Instalacao</label><select id="metodoInstalacao-${id}"><option value="A1">A1</option><option value="A2">A2</option><option value="B1" selected>B1</option><option value="B2">B2</option><option value="C">C</option><option value="D">D</option></select></div><div class="form-group"><label for="temperaturaAmbienteC-${id}">Temperatura Ambiente (C)</label><select id="temperaturaAmbienteC-${id}"><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30" selected>30</option><option value="35">35</option><option value="40">40</option><option value="45">45</option><option value="50">50</option></select></div><div class="form-group"><label for="resistividadeSolo-${id}">Resistividade T. do Solo (C.m/W)</label><select id="resistividadeSolo-${id}"><option value="0" selected>Nao Aplicavel</option><option value="0.7">0.7</option><option value="0.8">0.8</option><option value="1.0">1.0</option><option value="1.5">1.5</option><option value="2.0">2.0</option><option value="2.5">2.5</option><option value="3.0">3.0</option></select></div><div class="form-group"><label for="numCircuitosAgrupados-${id}">N de Circuitos Agrupados</label><input type="number" id="numCircuitosAgrupados-${id}" value="1"></div><div class="form-group"><label for="limiteQuedaTensao-${id}">Limite Queda de Tensao (%)</label><input type="number" id="limiteQuedaTensao-${id}" step="0.1" value="4.0"></div><div class="form-group"><label for="tipoDisjuntor-${id}">Tipo de Disjuntor</label><select id="tipoDisjuntor-${id}"><option value="Minidisjuntor (DIN)">Minidisjuntor (DIN)</option><option value="Caixa Moldada (MCCB)">Caixa Moldada (MCCB)</option></select></div><div class="form-group"><label for="classeDPS-${id}">Protecao DPS</label><select id="classeDPS-${id}"><option value="Nenhum">Nenhuma</option><option value="Classe I">Classe I</option><option value="Classe II">Classe II</option><option value="Classe III">Classe III</option></select><div class="checkbox-group"><input type="checkbox" id="requerDR-${id}"><label for="requerDR-${id}">Requer Protecao DR</label></div></div></div></div>`;
}

// --- PREENCHIMENTO DE DADOS ---
export function populateProjectList(projects, isAdmin) {
    const select = document.getElementById('savedProjectsSelect');
    select.innerHTML = '<option value="">-- Selecione uma obra --</option>';
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        let text = project.project_name;
        if (isAdmin && project.profile) {
            text += ` (${project.profile.nome})`;
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
        if(!user.is_admin) {
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
            <td>${project.profile?.nome || 'Desconhecido'}</td>
            <td>
                <select>${userOptions}</select>
                <button class="transfer-btn" data-project-id="${project.id}">Transferir</button>
            </td>`;
        tableBody.appendChild(row);
    });
}

// --- RELATÓRIOS E PDF ---
export function renderReport(allResults){
    if(!allResults || allResults.length === 0) return;
    const dataHora = (new Date).toLocaleString('pt-BR');
    const formatLine = (label, value) => (label + ':').padEnd(28, ' ') + value;
    let reportText = `======================================================\n==           RELATORIO DE PROJETO ELETRICO           ==\n======================================================\n${formatLine('Gerado em', dataHora)}\n`;
    const dadosCliente = allResults[0].dados;
    reportText += `\n-- DADOS DA OBRA E CLIENTE --\n`;
    reportText += `${formatLine('Cliente', dadosCliente.cliente || 'Nao informado')}\n`;
    reportText += `${formatLine(`Documento (${dadosCliente.tipoDocumento})`, dadosCliente.documento || 'Nao informado')}\n`;
    reportText += `${formatLine('Contato', dadosCliente.celular || dadosCliente.telefone || 'Nao informado')}\n`;
    reportText += `${formatLine('E-mail', dadosCliente.email || 'Nao informado')}\n`;
    reportText += `${formatLine('Obra', dadosCliente.obra || 'Nao informado')}\n`;
    reportText += `${formatLine('Endereco', dadosCliente.endereco || 'Nao informado')}\n`;
    reportText += `${formatLine('Area da Obra', (dadosCliente.areaObra || 'Nao informado') + ' m2')}\n`;
    const respTecnico = document.getElementById('respTecnico').value;
    const titulo = document.getElementById('titulo').value;
    const crea = document.getElementById('crea').value;
    if (respTecnico || titulo || crea) {
        reportText += `\n-- RESPONSAVEL TECNICO --\n`;
        reportText += `${formatLine('Nome', respTecnico || 'Nao informado')}\n`;
        reportText += `${formatLine('Titulo', titulo || 'Nao informado')}\n`;
        reportText += `${formatLine('CREA', crea || 'Nao informado')}\n`;
    }
    reportText += `\n-- QUADRO DE CARGAS RESUMIDO --\n`;
    allResults.forEach(result => {
        reportText += `${formatLine(`Circuito ${result.dados.id}`, `${result.dados.nomeCircuito} - ${result.calculos.potenciaDemandada.toFixed(2)} W`)}\n`;
    });
    allResults.forEach(result => {
        const { dados, calculos } = result;
        reportText += `\n\n======================================================\n==           MEMORIAL DE CALCULO - CIRCUITO ${dados.id}           ==\n======================================================\n`;
        reportText += `\n-- IDENTIFICACAO DO CIRCUITO --\n`;
        reportText += `${formatLine('Nome do Circuito', dados.nomeCircuito)}\n`;
        reportText += `${formatLine('Tipo de Circuito', dados.tipoCircuito.replace(/_/g, ' '))}\n`;
        reportText += `\n-- CARGA E DEMANDA --\n`;
        reportText += `${formatLine('Potencia Instalada', `${calculos.potenciaInstalada.toFixed(2)} W`)}\n`;
        reportText += `${formatLine('Corrente Instalada', `${calculos.correnteInstalada.toFixed(2)} A`)}\n`;
        reportText += `${formatLine('Fator de Demanda Aplicado', dados.fatorDemanda)}\n`;
        reportText += `${formatLine('Potencia Demandada', `${calculos.potenciaDemandada.toFixed(2)} W`)}\n`;
        reportText += `${formatLine('Corrente Demandada (Ib)', `${calculos.correnteDemandada.toFixed(2)} A`)}\n`;
        reportText += `\n-- ESPECIFICACOES DO CABO E CORRECOES --\n`;
        reportText += `${formatLine('Material / Isolacao', `${dados.materialCabo} / ${dados.tipoIsolacao}`)}\n`;
        reportText += `${formatLine('Metodo de Instalacao', dados.metodoInstalacao)}\n`;
        reportText += `${formatLine('Fatores de Correcao', `K1=${calculos.fatorK1.toFixed(2)}, K2=${calculos.fatorK2.toFixed(2)}, K3=${calculos.fatorK3.toFixed(2)}`)}\n`;
        reportText += `${formatLine('Corrente p/ Dimensionar', `${calculos.correnteCorrigidaA.toFixed(2)} A`)}\n`;
        reportText += `\n-- RESULTADOS DE DIMENSIONAMENTO --\n`;
        reportText += `${formatLine('Bitola Recomendada', `${calculos.bitolaRecomendadaMm2} mm2`)}\n`;
        reportText += `${formatLine('Resistencia do Cabo', `${calculos.resistenciaCabo.toFixed(4)} Ohm`)}\n`;
        reportText += `${formatLine('Queda de Tensao (DV)', `${calculos.quedaTensaoCalculada.toFixed(2)} %`)}\n`;
        reportText += `${formatLine('Limite de Queda de Tensao', `${dados.limiteQuedaTensao.toFixed(2)} %`)}\n`;
        reportText += `${formatLine('Corrente Max. Cabo (Iz)', `${calculos.correnteMaximaCabo.toFixed(2)} A`)}\n`;
        reportText += `${formatLine('Potencia Max. Cabo', `${calculos.potenciaMaximaCabo.toFixed(2)} W`)}\n`;
        reportText += `\n-- PROTECOES RECOMENDADAS --\n`;
        reportText += `${formatLine(`Disjuntor (${dados.tipoDisjuntor})`, `${calculos.disjuntorRecomendado.nome} (Icc: ${calculos.disjuntorRecomendado.icc} kA)`)}\n`;
        reportText += `${formatLine('Protecao DR 30mA', dados.requerDR ? `Sim (usar ${calculos.disjuntorRecomendado.nome.replace('A','')}A / 30mA)` : 'Nao')}\n`;
        reportText += `${formatLine('Protecao DPS', dados.classeDPS !== 'Nenhum' ? `Sim, ${dados.classeDPS} (ex: 20kA)` : 'Nao')}\n`;
        reportText += `${formatLine('Eletroduto (aprox.)', `${calculos.dutoRecomendado} (${calculos.numCondutores} condutores)`)}\n`;
    });
    document.getElementById('report').textContent = reportText.trim();
}

export function generatePdf(allResults, currentUserProfile) {
    if (!allResults) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let yPos = 15;
    doc.setFont('Roboto', 'normal');
    const addText = (text, indent = 10) => {
        if (yPos > 280) { doc.addPage(); yPos = 15; }
        doc.text(text, indent, yPos);
        yPos += 5;
    };
    doc.setFontSize(10);
    const formatLine = (label, value) => (label + ':').padEnd(20, ' ') + (value || 'Nao informado');
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.text("Relatorio de Projeto Eletrico", 105, yPos, { align: 'center' });
    yPos += 10;
    const dadosCliente = allResults[0].dados;
    doc.setFont('Roboto', 'bold'); addText("-- DADOS DA OBRA E CLIENTE --");
    doc.setFont('Roboto', 'normal');
    addText(formatLine('Cliente', dadosCliente.cliente));
    addText(formatLine(`Documento`, `${dadosCliente.tipoDocumento} - ${dadosCliente.documento}`));
    addText(formatLine('Contato', dadosCliente.celular || dadosCliente.telefone));
    addText(formatLine('E-mail', dadosCliente.email));
    addText(formatLine('Obra', dadosCliente.obra));
    addText(formatLine('Endereco', dadosCliente.endereco));
    addText(formatLine('Area da Obra', `${dadosCliente.areaObra || 'N/A'} m2`));
    yPos += 5;
    const respTecnico = document.getElementById('respTecnico').value;
    const titulo = document.getElementById('titulo').value;
    const crea = document.getElementById('crea').value;
    if (respTecnico || titulo || crea) {
        doc.setFont('Roboto', 'bold'); addText("-- RESPONSAVEL TECNICO --");
        doc.setFont('Roboto', 'normal');
        addText(formatLine('Nome', respTecnico));
        addText(formatLine('Titulo', titulo));
        addText(formatLine('CREA', crea));
        yPos += 5;
    }
    const generatingUserName = currentUserProfile?.nome || 'Usuário';
    doc.setFont('Roboto', 'bold'); addText("-- INFORMACOES DO RELATORIO --");
    doc.setFont('Roboto', 'normal');
    addText(formatLine('Gerado em', (new Date).toLocaleString('pt-BR')));
    addText(formatLine('Gerado por', generatingUserName));
    yPos += 5;
    const head = [['Ckt', 'Nome', 'Pot.(W)', 'Tensao(V)', 'Fases', 'Cabo', 'Disjuntor', 'DR', 'DPS']];
    const body = allResults.map(r => [
        r.dados.id,
        r.dados.nomeCircuito,
        r.calculos.potenciaDemandada.toFixed(2),
        r.dados.tensaoV,
        r.dados.fases,
        r.calculos.bitolaRecomendadaMm2 + 'mm2',
        r.calculos.disjuntorRecomendado.nome,
        r.dados.requerDR ? 'Sim' : 'Nao',
        r.dados.classeDPS
    ]);
    doc.autoTable({ startY: yPos, head: head, body: body, theme: 'grid', styles: { font: "Roboto", fontSize: 8 } });
    allResults.forEach(result => {
        doc.addPage();
        yPos = 15;
        const { dados, calculos } = result;
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(12);
        doc.text(`MEMORIAL DE CALCULO - CIRCUITO ${dados.id}: ${dados.nomeCircuito}`, 10, yPos);
        yPos += 10;
        const addSection = (title, lines) => {
            doc.setFont('Roboto', 'bold');
            doc.setFontSize(10);
            addText(title);
            doc.setFont('Roboto', 'normal');
            lines.forEach(line => addText(line, 15));
        };
        addSection("-- CARGA E DEMANDA --", [`Potencia Instalada: ${calculos.potenciaInstalada.toFixed(2)} W`, `Corrente Instalada: ${calculos.correnteInstalada.toFixed(2)} A`, `Fator de Demanda: ${dados.fatorDemanda}`, `Potencia Demandada: ${calculos.potenciaDemandada.toFixed(2)} W`, `Corrente Demandada (Ib): ${calculos.correnteDemandada.toFixed(2)} A`]);
        yPos += 3;
        addSection("-- DIMENSIONAMENTO DO CABO --", [`Material / Isolacao: ${dados.materialCabo} / ${dados.tipoIsolacao}`, `Metodo de Instalacao: ${dados.metodoInstalacao}`, `Fatores de Correcao (K): K1=${calculos.fatorK1.toFixed(2)}, K2=${calculos.fatorK2.toFixed(2)}, K3=${calculos.fatorK3.toFixed(2)}`, `Corrente Corrigida (I'): ${calculos.correnteCorrigidaA.toFixed(2)} A`, `Bitola Recomendada: ${calculos.bitolaRecomendadaMm2} mm2`, `Queda de Tensao (DV): ${calculos.quedaTensaoCalculada.toFixed(2)} % (Limite: ${dados.limiteQuedaTensao.toFixed(2)} %)`]);
        yPos += 3;
        addSection("-- PROTECOES RECOMENDADAS --", [`Disjuntor (${dados.tipoDisjuntor}): ${calculos.disjuntorRecomendado.nome} (Icc: ${calculos.disjuntorRecomendado.icc} kA)`, `Corrente Max. Cabo (Iz): ${calculos.correnteMaximaCabo.toFixed(2)} A`, `Protecao DR 30mA: ${dados.requerDR ? 'Sim' : 'Nao'}`, `Protecao DPS: ${dados.classeDPS !== 'Nenhum' ? 'Sim, ' + dados.classeDPS : 'Nao'}`, `Eletroduto (aprox.): ${calculos.dutoRecomendado} (${calculos.numCondutores} condutores)`]);
    });
    doc.save(`Relatorio_${document.getElementById('obra').value || 'Projeto'}.pdf`);
}