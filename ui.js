// Arquivo: ui.js

import { ligacoes } from './utils.js';

let circuitCount = 0;
let tempOptions = { pvc: [], epr: [] };
let dpsOptions = { I: [], II: [] };

// --- PREPARAÇÃO DE DADOS DINÂMICOS ---
export function setupDynamicOptions(techData) {
    if (techData?.fatores_k1) {
        tempOptions.pvc = techData.fatores_k1.map(f => f.temperatura_c).sort((a, b) => a - b);
    }
    if (techData?.fatores_k1_epr) {
        tempOptions.epr = techData.fatores_k1_epr.map(f => f.temperatura_c).sort((a, b) => a - b);
    } else {
        tempOptions.epr = tempOptions.pvc; // Fallback
    }
    if (techData?.dps) {
        dpsOptions.I = techData.dps.filter(d => d.classe === 'I').map(d => d.corrente_ka);
        dpsOptions.II = techData.dps.filter(d => d.classe === 'II').map(d => d.corrente_ka);
    }
}

function populateDropdown(selectElement, options, textFormatter = (val) => val) {
    const currentValue = selectElement.value;
    selectElement.innerHTML = '';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = textFormatter(opt);
        selectElement.appendChild(option);
    });
    if (options.map(String).includes(currentValue)) {
        selectElement.value = currentValue;
    } else if (options.length > 0) {
        selectElement.value = options[0];
    }
}

// --- CONTROLE DE VISIBILIDADE E MODAIS ---
export function showLoginView() { /* ...código existente... */ }
export function showAppView(userProfile) { /* ...código existente... */ }
export function showResetPasswordView() { /* ...código existente... */ }
export function openModal(modalId) { /* ...código existente... */ }
export function closeModal(modalId) { /* ...código existente... */ }

// --- MANIPULAÇÃO DO FORMULÁRIO ---
export function resetForm(addFirst = true, client = null) {
    document.getElementById('main-form').reset();
    document.getElementById('tech-form').reset();
    document.getElementById('feeder-form').reset();
    document.getElementById('currentProjectId').value = '';
    document.getElementById('circuits-container').innerHTML = '';
    document.getElementById('report').textContent = 'O relatório aparecerá aqui.';
    
    const clientLinkDisplay = document.getElementById('clientLinkDisplay');
    const currentClientIdInput = document.getElementById('currentClientId');
    if (client) {
        clientLinkDisplay.textContent = `Cliente Vinculado: ${client.nome} (${client.client_code})`;
        currentClientIdInput.value = client.id;
    } else {
        clientLinkDisplay.textContent = 'Cliente: Nenhum';
        currentClientIdInput.value = '';
    }
    
    initializeFeederListeners();
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
}

function initializeFeederListeners() {
    const fases = document.getElementById('feederFases');
    const tipoLigacao = document.getElementById('feederTipoLigacao');
    const dpsClasse = document.getElementById('feederDpsClasse');
    const dpsIka = document.getElementById('feederDpsIka');

    const atualizarLigacoes = () => { /* ... */ };
    const handleDpsChange = () => {
        dpsIka.innerHTML = '<option value="">--</option>';
        const options = dpsOptions[dpsClasse.value] || [];
        populateDropdown(dpsIka, options, val => `${val} kA`);
    };

    fases.addEventListener('change', atualizarLigacoes);
    dpsClasse.addEventListener('change', handleDpsChange);
    atualizarLigacoes();
    handleDpsChange();
}

function initializeCircuitListeners(id) {
    const dpsClasse = document.getElementById(`dpsClasse-${id}`);
    const dpsIka = document.getElementById(`dpsIka-${id}`);
    const fatorDemandaInput = document.getElementById(`fatorDemanda-${id}`);
    const tipoCircuito = document.getElementById(`tipoCircuito-${id}`);

    const handleDpsChange = () => {
        dpsIka.innerHTML = '<option value="">--</option>';
        const options = dpsOptions[dpsClasse.value] || [];
        populateDropdown(dpsIka, options, val => `${val} kA`);
    };
    
    const handleCircuitTypeChange = () => {
        if (tipoCircuito.value === 'aquecimento') {
            fatorDemandaInput.value = '100';
            fatorDemandaInput.readOnly = true;
        } else {
            fatorDemandaInput.readOnly = false;
        }
    };
    
    dpsClasse.addEventListener('change', handleDpsChange);
    tipoCircuito.addEventListener('change', handleCircuitTypeChange);
    handleDpsChange();
}

function getCircuitHTML(id) {
    return `<div class="circuit-block" id="circuit-${id}" data-id="${id}">
                <div class="form-group">
                    <label for="tipoIsolacao-${id}">Isolação</label>
                    <select id="tipoIsolacao-${id}">
                        <option value="PVC" selected>PVC 70°C</option>
                        <option value="EPR">EPR 90°C</option>
                        <option value="HEPR">HEPR 90°C</option>
                        <option value="LSZH">LSZH 90°C</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="dpsClasse-${id}">DPS Classe</label>
                    <select id="dpsClasse-${id}"><option value="">Nenhum</option><option value="I">I</option><option value="II">II</option></select>
                </div>
                <div class="form-group">
                    <label for="dpsIka-${id}">DPS Ika (kA)</label>
                    <select id="dpsIka-${id}"></select>
                </div>
                </div>`;
}

// --- PREENCHIMENTO DE DADOS E FORMULÁRIOS ---
export function populateFormWithProjectData(project) {
    // ...
    if (project.feeder_data) { 
        Object.keys(project.feeder_data).forEach(id => { 
            const el = document.getElementById(id);
            if (el) { 
                if(el.type === 'checkbox') el.checked = project.feeder_data[id];
                else el.value = project.feeder_data[id];
            }
        });
        document.getElementById('feederDpsClasse').dispatchEvent(new Event('change'));
        document.getElementById('feederDpsIka').value = project.feeder_data['feederDpsIka'];
    }
    // ...
}

// --- GERAÇÃO DE PDF ---
export function generatePdf(calculationResults, currentUserProfile) {
    if (!calculationResults) return;
    const { geral, circuitos, totais } = calculationResults;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPos = 20;

    const addTitle = (title) => { /* ... */ };
    const addSection = (title) => { /* ... */ };
    const addLineItem = (label, value) => { /* ... */ };
    
    // --- PÁGINA 1: RESUMO ---
    addTitle("RELATÓRIO DE PROJETO ELÉTRICO");
    // ... (dados do cliente e responsável) ...

    addSection("RESUMO DA ALIMENTAÇÃO GERAL");
    const headGeral = [['Carga Total', 'Disjuntor Geral', 'DR', 'DPS', 'Cabo', 'Eletroduto']];
    const bodyGeral = [[
        `${geral.calculos.potenciaDemandada.toFixed(2)} W`,
        `${geral.dados.tipoDisjuntor.includes('Caixa Moldada') ? 'MCCB' : 'DIN'} ${geral.calculos.disjuntorRecomendado.nome}`,
        geral.dados.requerDR ? 'Sim' : 'Nao',
        getDpsText(geral.dados.dpsInfo),
        `${geral.calculos.bitolaRecomendadaMm2} mm² (${geral.dados.tipoIsolacao})`,
        geral.calculos.dutoRecomendado
    ]];
    doc.autoTable({ startY: yPos, head: headGeral, body: bodyGeral });
    yPos = doc.lastAutoTable.finalY + 10;
    
    addSection("TOTALIZADORES DA INSTALAÇÃO");
    addLineItem("Soma das Potências Demandadas:", `${totais.potenciaDemandada.toFixed(2)} W`);
    addLineItem("Soma das Correntes Demandadas:", `${totais.correnteDemandada.toFixed(2)} A`);
    yPos += 5;

    addSection("RESUMO DOS CIRCUITOS");
    const headCircuitos = [['Ckt', 'Nome', 'Tipo', 'Pot.(W)', 'Disjuntor', 'Cabo']];
    const bodyCircuitos = circuitos.map(r => [
        r.dados.id,
        r.dados.nomeCircuito,
        r.dados.tipoCircuito.replace(/_/g, ' '),
        r.calculos.potenciaDemandada.toFixed(2),
        r.calculos.disjuntorRecomendado.nome,
        `${r.calculos.bitolaRecomendadaMm2} mm²`
    ]);
    doc.autoTable({ startY: yPos, head: headCircuitos, body: bodyCircuitos });
    
    // --- MEMORIAIS DE CÁLCULO ---
    const allCalculations = [geral, ...circuitos];
    allCalculations.forEach(result => {
        doc.addPage();
        yPos = 20;
        const { dados, calculos } = result;
        const title = dados.id === 'Geral' 
            ? `MEMORIAL DE CÁLCULO - ALIMENTADOR GERAL`
            : `MEMORIAL DE CÁLCULO - CIRCUITO ${dados.id}: ${dados.nomeCircuito}`;
        addTitle(title);

        addSection("-- DIMENSIONAMENTO DE INFRA --");
        addTwoColumnLine("Material / Isolação:", `${dados.materialCabo} / ${dados.tipoIsolacao}`, "Método de Instalação:", dados.metodoInstalacao);
        addTwoColumnLine("Bitola Recomendada:", `${calculos.bitolaRecomendadaMm2} mm²`, "Corrente Max. Cabo:", `${calculos.correnteMaximaCabo.toFixed(2)} A`);
        // --- AJUSTE DE ALINHAMENTO E ADIÇÃO DA DISTÂNCIA ---
        addTwoColumnLine("Eletroduto (aprox.):", `${calculos.dutoRecomendado} (${calculos.numCondutores} condutores)`, "Distância:", `${dados.comprimentoM} m`);
        yPos += 5;

        addSection("-- PROTECOES RECOMENDADAS --");
        addLineItem("Disjuntor:", `${dados.tipoDisjuntor}: ${calculos.disjuntorRecomendado.nome} (Icc: ${calculos.disjuntorRecomendado.icc} kA)`);
        addLineItem("Proteção DR:", dados.requerDR ? `Sim (${calculos.disjuntorRecomendado.nome} / 30mA)` : 'Não');
        addLineItem("Proteção DPS:", dados.classeDPS !== 'Nenhum' ? `Sim, ${dados.classeDPS}` : 'Não');
    });

    doc.save(`Relatorio_${document.getElementById('obra').value || 'Projeto'}.pdf`);
}

function getDpsText(dpsInfo) {
    if (!dpsInfo) return 'Nao';
    return `Sim, Classe ${dpsInfo.classe} (${dpsInfo.corrente_ka} kA)`;
}