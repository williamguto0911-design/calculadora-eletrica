// Arquivo: utils.js
export const ligacoes = { Monofasico: [{value:'FN', text:'Fase-Neutro (FN)'}, {value:'FF', text:'Fase-Fase (FF)'}], Bifasico: [{value:'FF', text:'Fase-Fase (FF)'}, {value:'FFN', text:'Fase-Fase-Neutro (FFN)'}], Trifasico: [{value:'FFF', text:'Fase-Fase-Fase (FFF)'}, {value:'FFFN', text:'Fase-Fase-Fase-Neutro (FFFN)'}] };

export function mascaraCPF(event){event.target.value=event.target.value.replace(/\D/g,"").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}
export function mascaraCelular(event){event.target.value=event.target.value.replace(/\D/g,'').replace(/^(\d{2})(\d)/g,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2')}
export function mascaraTelefone(event){event.target.value=event.target.value.replace(/\D/g,'').replace(/^(\d{2})(\d)/g,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2')}
export function aplicarMascara(event, tipoDoc) { const doc = tipoDoc || document.getElementById('tipoDocumento').value; let value = event.target.value.replace(/\D/g,""); if(doc==='CPF'){value=value.slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}else{value=value.slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')} event.target.value=value}
export function atualizarMascaraDocumento(){const tipoDoc=document.getElementById('tipoDocumento').value;const inputDoc=document.getElementById('documento');inputDoc.value='';if(tipoDoc==='CPF'){inputDoc.placeholder='000.000.000-00';inputDoc.maxLength=14}else{inputDoc.placeholder='00.000.000/0000-00';inputDoc.maxLength=18}}

export function calcularProjetoCompleto(technicalData, clientProfile = null) {
    if (!technicalData) {
        alert("Dados técnicos não carregados.");
        return null;
    }

    const circuitResults = _calcularCircuitosIndividuais(technicalData, clientProfile);
    if (circuitResults === null) return null;

    const totalPotenciaDemandada = circuitResults.reduce((sum, result) => sum + result.calculos.potenciaDemandada, 0);
    const totalCorrenteDemandada = circuitResults.reduce((sum, result) => sum + result.calculos.correnteDemandada, 0);

    const feederResult = _calcularAlimentadorGeral(technicalData, totalPotenciaDemandada, clientProfile);
    
    return { 
        circuitos: circuitResults, 
        totais: { 
            potenciaDemandada: totalPotenciaDemandada, 
            correnteDemandada: totalCorrenteDemandada 
        },
        geral: feederResult
    };
}

function _calcularCircuitosIndividuais(technicalData, clientProfile) {
    const allResults = [];
    const circuitBlocks = document.querySelectorAll('#circuits-container .circuit-block');
    
    for (const block of circuitBlocks) {
        const id = block.dataset.id;
        const dados = { /* ... coleta de dados do circuito ... */ };
        
        if (dados.tipoCircuito === 'aquecimento' && dados.fatorDemanda > 1) {
            alert(`Erro no Circuito ${id}: Fator de demanda para aquecimento não pode ser > 1.`);
            return null;
        }
        
        dados.dpsInfo = findDps(technicalData.dps, dados.dpsClasse, dados.dpsIka);
        
        const calculos = performCalculation(dados, technicalData);
        allResults.push({ dados, calculos });
    }
    return allResults;
}

function _calcularAlimentadorGeral(technicalData, potenciaTotal) {
    const dados = {
        id: 'Geral',
        nomeCircuito: 'Alimentador Principal (QDC)',
        potenciaW: potenciaTotal,
        fatorDemanda: 1.0,
        fatorPotencia: 0.92,
        limiteQuedaTensao: 5.0,
        numCircuitosAgrupados: 1,
        resistividadeSolo: 0,
        fases: document.getElementById('feederFases').value,
        tensaoV: parseFloat(document.getElementById('feederTensaoV').value),
        comprimentoM: parseFloat(document.getElementById('feederComprimentoM').value),
        materialCabo: document.getElementById('feederMaterialCabo').value,
        tipoIsolacao: document.getElementById('feederTipoIsolacao').value,
        metodoInstalacao: document.getElementById('feederMetodoInstalacao').value,
        tipoDisjuntor: document.getElementById('feederTipoDisjuntor').value,
        temperaturaAmbienteC: 30, // Assumindo valor padrão
        dpsClasse: document.getElementById('feederDpsClasse').value,
        dpsIka: document.getElementById('feederDpsIka').value,
    };
    dados.dpsInfo = findDps(technicalData.dps, dados.dpsClasse, dados.dpsIka);
    const calculos = performCalculation(dados, technicalData);
    return { dados, calculos };
}

function findDps(dpsList, classe, corrente) {
    if (!classe || !corrente || !dpsList) return null;
    return dpsList.find(d => d.classe === classe && d.corrente_ka == corrente) || null;
}

function performCalculation(dados, technicalData) {
    const potenciaInstalada = dados.potenciaW;
    const potenciaDemandada = potenciaInstalada * dados.fatorDemanda;
    
    const divisorTensao = (dados.fases === 'Trifasico') ? (dados.tensaoV * 1.732 * dados.fatorPotencia) : (dados.tensaoV * dados.fatorPotencia);
    const correnteDemandada = potenciaDemandada / divisorTensao;

    const fatorK1 = technicalData.fatores_k1.find(f => f.temperatura_c === dados.temperaturaAmbienteC)?.fator || 1.0;
    
    let fatorK3 = 1.0;
    const fatorK3_obj = technicalData.fatores_k3.find(f => f.num_circuitos === dados.numCircuitosAgrupados);
    if (fatorK3_obj) {
        const metodo = dados.metodoInstalacao;
        if (metodo.startsWith('A') || metodo.startsWith('B')) fatorK3 = fatorK3_obj.fator_metodo_a_b;
        else if (metodo.startsWith('C') || metodo.startsWith('D')) fatorK3 = fatorK3_obj.fator_metodo_c_d;
    }

    const correnteCorrigidaA = correnteDemandada / (fatorK1 * fatorK3);
    
    let bitolaRecomendadaMm2="N/A", quedaTensaoCalculada=0, disjuntorRecomendado={nome:"N/A",icc:0};
    
    const listaDisjuntores = technicalData.disjuntores.filter(d => d.tipo === dados.tipoDisjuntor).sort((a,b) => a.corrente_a - b.corrente_a);
    const disjuntorCandidato = listaDisjuntores.find(d => d.corrente_a >= correnteDemandada);

    if (disjuntorCandidato) {
        const tabelaCabo = technicalData.cabos.filter(c => c.material === dados.materialCabo && c.isolacao === dados.tipoIsolacao).sort((a,b) => a.secao_mm2 - b.secao_mm2);
        for(const cabo of tabelaCabo){
            const capacidadeConducao = cabo[`capacidade_${dados.metodoInstalacao.toLowerCase()}`] || 0;
            const Iz = capacidadeConducao * fatorK1 * fatorK3;
            if (Iz >= disjuntorCandidato.corrente_a) {
                const resistividade = (dados.materialCabo === 'Cobre') ? 0.0172 : 0.0282;
                const multiplicadorFases = (dados.fases === 'Trifasico') ? 1.732 : 2;
                const quedaVolts = (multiplicadorFases * resistividade * dados.comprimentoM * correnteDemandada) / cabo.secao_mm2;
                const quedaPercentual = (quedaVolts / dados.tensaoV) * 100.0;
                
                if (quedaPercentual <= dados.limiteQuedaTensao) {
                    bitolaRecomendadaMm2 = cabo.secao_mm2.toString();
                    quedaTensaoCalculada = quedaPercentual;
                    disjuntorRecomendado = { nome: disjuntorCandidato.nome, icc: disjuntorCandidato.icc_ka };
                    break;
                }
            }
        }
    }
    
    return {potenciaDemandada, correnteDemandada, bitolaRecomendadaMm2, quedaTensaoCalculada, disjuntorRecomendado, dutoRecomendado: "N/A"};
}