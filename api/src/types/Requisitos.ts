export class Requisito {
    private _requisitoId: number;
    _codigoRequisito: string;
    _textoOriginalRequisito: string;
    _contextoNormativoRequisito:  string;
    _interpretacaoTecnicaRequisito: string;
    _abordagensAceitaveisRequisito: string;
    _pontosAtencaoRequisito:  string;

    constructor(
        requsitoId: number,
        codigoRequisito: string,
        textoOriginalRequisito: string,
        contextoNormativoRequisito:  string,
        interpretacaoTecnicaRequisito: string,
        abordagensAceitaveisRequisito: string,
        pontosAtencaoRequisito:  string,
    ){
        this._requisitoId = requsitoId;
        this._codigoRequisito = codigoRequisito;
        this._textoOriginalRequisito = textoOriginalRequisito;
        this._contextoNormativoRequisito = contextoNormativoRequisito;
        this._interpretacaoTecnicaRequisito = interpretacaoTecnicaRequisito;
        this._abordagensAceitaveisRequisito = abordagensAceitaveisRequisito;
        this._pontosAtencaoRequisito = pontosAtencaoRequisito;
    }

    get requisitoId(){
        return this._requisitoId;
    }
}