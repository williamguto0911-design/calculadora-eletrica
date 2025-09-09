// Arquivo: utils.js

// A constante 'ligacoes' permanece pois está mais ligada à UI do que a dados técnicos.
export const ligacoes = { Monofasico: [{value:'FN', text:'Fase-Neutro (FN)'}, {value:'FF', text:'Fase-Fase (FF)'}], Bifasico: [{value:'FF', text:'Fase-Fase (FF)'}, {value:'FFN', text:'Fase-Fase-Neutro (FFN)'}], Trifasico: [{value:'FFF', text:'Fase-Fase-Fase (FFF)'}, {value:'FFFN', text:'Fase-Fase-Fase-Neutro (FFFN)'}] };

// FUNÇÕES DE MÁSCARA (permanecem as mesmas)
export function mascaraCPF(event){event.target.value=event.target.value.replace(/\D/g,"").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}
export function mascaraCelular(event){event.target.value=event.target.value.replace(/\D/g,'').replace(/^(\d{2})(\d)/g,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2')}
export function mascaraTelefone(event){event.target.value=event.target.value.replace(/\D/g,'').replace(/^(\d{2})(\d)/g,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2')}
export function aplicarMascara(event){const tipoDoc=document.getElementById('tipoDocumento').value;let value=event.target.value.replace(/\D/g,"");if(tipoDoc==='CPF'){value=value.slice(0,11).replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d)/,"$1.$2").replace(/(\d{3})(\d{1,2})$/,"$1-$2")}else{value=value.slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')}
event.target.value=value}
export function atualizarMascaraDocumento(){const tipoDoc=document.getElementById('tipoDocumento').value;const inputDoc=document.getElementById('documento');inputDoc.value='';if(tipoDoc==='CPF'){inputDoc.placeholder='000.000.000-00';inputDoc.maxLength=14}else{inputDoc.placeholder='00.000.000/0000-00';inputDoc.maxLength=18}}

// FUNÇÕES DE CÁLCULO ATUALIZADAS
/**
 * A função agora recebe os dados técnicos (technicalData) como um parâmetro,
 * em vez de usar as constantes que foram removidas.
 */
export function calcularTodosCircuitos(technicalData){
    if (!technicalData) {
        alert("Os dados técnicos não foram carregados. Verifique a conexão com o banco de dados.");
        return null;
    }

    const allResults=[];
    const circuitBlocks=document.querySelectorAll('.circuit-block');
    if(circuitBlocks.length===0){
        alert("Adicione pelo menos um circuito para calcular.");
        return null;
    }
    
    circuitBlocks.forEach(block=>{
        const id=block.dataset.id;
        const dados={id:id,cliente:document.getElementById('cliente').value,tipoDocumento:document.getElementById('tipoDocumento').value,documento:document.getElementById('documento').value,telefone:document.getElementById('telefone').value,celular:document.getElementById('celular').value,email:document.getElementById('email').value,obra:document.getElementById('obra').value,endereco:document.getElementById('endereco').value,areaObra:document.getElementById('areaObra').value,nomeCircuito:document.getElementById(`nomeCircuito-${id}`).value,tipoCircuito:document.getElementById(`tipoCircuito-${id}`).value,potenciaW:parseFloat(document.getElementById(`potenciaW-${id}`).value),potenciaCV:parseFloat(document.getElementById(`potenciaCV-${id}`).value),fatorDemanda:parseFloat(document.getElementById(`fatorDemanda-${id}`).value),fases:document.getElementById(`fases-${id}`).value,tipoLigacao:document.getElementById(`tipoLigacao-${id}`).value,tensaoV:parseFloat(document.getElementById(`tensaoV-${id}`).value),fatorPotencia:parseFloat(document.getElementById(`fatorPotencia-${id}`).value),comprimentoM:parseFloat(document.getElementById(`comprimentoM-${id}`).value),tipoIsolacao:document.getElementById(`tipoIsolacao-${id}`).value,materialCabo:document.getElementById(`materialCabo-${id}`).value,metodoInstalacao:document.getElementById(`metodoInstalacao-${id}`).value,temperaturaAmbienteC:parseInt(document.getElementById(`temperaturaAmbienteC-${id}`).value),resistividadeSolo:parseFloat(document.getElementById(`resistividadeSolo-${id}`).value),numCircuitosAgrupados:parseInt(document.getElementById(`numCircuitosAgrupados-${id}`).value),limiteQuedaTensao:parseFloat(document.getElementById(`limiteQuedaTensao-${id}`).value),tipoDisjuntor:document.getElementById(`tipoDisjuntor-${id}`).value,requerDR:document.getElementById(`requerDR-${id}`).checked,classeDPS:document.getElementById(`classeDPS-${id}`).value,};
        
        if(dados.tipoCircuito==='motores')dados.potenciaW=dados.potenciaCV*735.5;

        const potenciaInstalada=dados.potenciaW;
        const potenciaDemandada=potenciaInstalada*dados.fatorDemanda;
        const correnteInstalada=(dados.fases==='Trifasico')?(potenciaInstalada/(dados.tensaoV*1.732*dados.fatorPotencia)):(potenciaInstalada/(dados.tensaoV*dados.fatorPotencia));
        const correnteDemandada=(dados.fases==='Trifasico')?(potenciaDemandada/(dados.tensaoV*1.732*dados.fatorPotencia)):(potenciaDemandada/(dados.tensaoV*dados.fatorPotencia));

        const fatorK1_obj = technicalData.fatores_k1.find(f => f.temperatura_c === dados.temperaturaAmbienteC);
        const fatorK1 = fatorK1_obj ? fatorK1_obj.fator : 1.0;

        const fatorK2_obj = technicalData.fatores_k2.find(f => f.resistividade === dados.resistividadeSolo);
        const fatorK2 = (dados.resistividadeSolo > 0 && fatorK2_obj) ? fatorK2_obj.fator : 1.0;
        
        const fatorK3_obj = technicalData.fatores_k3.find(f => f.num_circuitos === dados.numCircuitosAgrupados);
        let fatorK3 = 1.0;
        if (fatorK3_obj) {
            const metodo = dados.metodoInstalacao;
            if (metodo.startsWith('A') || metodo.startsWith('B')) {
                fatorK3 = fatorK3_obj.fator_metodo_a_b;
            } else if (metodo.startsWith('C') || metodo.startsWith('D')) {
                fatorK3 = fatorK3_obj.fator_metodo_c_d;
            }
        }

        const correnteCorrigidaA=correnteDemandada/(fatorK1*fatorK2*fatorK3);
        let bitolaRecomendadaMm2="Nao encontrada",quedaTensaoCalculada=0,resistenciaCabo=0,correnteMaximaCabo=0,disjuntorRecomendado={nome:"Coord. Inadequada",icc:0};
        
        const listaDisjuntores = technicalData.disjuntores.filter(d => d.tipo === dados.tipoDisjuntor);
        const disjuntorCandidato = listaDisjuntores.find(d => d.corrente_a >= correnteDemandada);

        if(disjuntorCandidato){
            let bitolaMinima=0;
            if(dados.tipoCircuito==='iluminacao')bitolaMinima=1.5;
            if(dados.tipoCircuito==='tug'||dados.tipoCircuito==='tue'||dados.tipoCircuito==='ar_condicionado')bitolaMinima=2.5;

            const tabelaCaboSelecionada = technicalData.cabos.filter(c => c.material === dados.materialCabo && c.isolacao === dados.tipoIsolacao && c.secao_mm2 >= bitolaMinima);
            
            for(const cabo of tabelaCaboSelecionada){
                const capacidadeConducao = cabo[`capacidade_${dados.metodoInstalacao.toLowerCase()}`] || 0;
                const Iz=capacidadeConducao*fatorK1*fatorK2*fatorK3;
                
                if(Iz >= disjuntorCandidato.corrente_a){
                    const resistividade=(dados.materialCabo==='Cobre')?0.0172:0.0282;
                    let quedaVolts=(dados.fases==='Trifasico')?((1.732*resistividade*dados.comprimentoM*correnteDemandada)/cabo.secao_mm2):((2*resistividade*dados.comprimentoM*correnteDemandada)/cabo.secao_mm2);
                    const quedaPercentual=(quedaVolts/dados.tensaoV)*100.0;
                    
                    if(quedaPercentual<=dados.limiteQuedaTensao){
                        bitolaRecomendadaMm2=cabo.secao_mm2.toString();
                        quedaTensaoCalculada=quedaPercentual;
                        resistenciaCabo=(resistividade*dados.comprimentoM)/cabo.secao_mm2;
                        correnteMaximaCabo=Iz;
                        disjuntorRecomendado = { nome: disjuntorCandidato.nome, icc: disjuntorCandidato.icc_ka };
                        break
                    }
                }
            }
        }

        const potenciaMaximaCabo=(dados.fases==='Trifasico')?(dados.tensaoV*correnteMaximaCabo*1.732*dados.fatorPotencia):(dados.tensaoV*correnteMaximaCabo*dados.fatorPotencia);
        let numCondutores=0;
        if(dados.fases==='Monofasico'){numCondutores=2}else if(dados.fases==='Bifasico'){if(dados.tipoLigacao==='FF')numCondutores=2;else if(dados.tipoLigacao==='FFN')numCondutores=3}else if(dados.fases==='Trifasico'){if(dados.tipoLigacao==='FFF')numCondutores=3;else if(dados.tipoLigacao==='FFFN')numCondutores=4}
        
        let dutoRecomendado="Nao encontrado";
        const bitolaNum=parseFloat(bitolaRecomendadaMm2);
        if (bitolaNum) {
            const duto_obj = technicalData.eletrodutos.find(e => e.num_condutores === numCondutores && e.secao_cabo_mm2 === bitolaNum);
            if (duto_obj) {
                dutoRecomendado = duto_obj.tamanho_nominal;
            }
        }

        allResults.push({dados,calculos:{potenciaInstalada,correnteInstalada,potenciaDemandada,correnteDemandada,fatorK1,fatorK2,fatorK3,correnteCorrigidaA,bitolaRecomendadaMm2,resistenciaCabo,quedaTensaoCalculada,correnteMaximaCabo,potenciaMaximaCabo,disjuntorRecomendado,numCondutores,dutoRecomendado}});
    });
    return allResults;
}