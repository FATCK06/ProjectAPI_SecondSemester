export class Norma{
    private _idNorma: number;
    _codigoNorma: string;
    _tituloNorma: string;
    _descricaoNorma: string;
    _dataPublicacaoNorma: Date;
    _revisaoNormaAtual: string;
    _revisaoNormaObsoleta: string;
    _statusNorma: number;

    constructor(
        idNorma: number,
        codigoNorma: string,
        tituloNorma: string,
        descricaoNorma: string,
        dataPublicacaoNorma: Date,
        revisaoNormaAtual: string,
        revisaoNormaObsoleta: string,
        statusNorma: number,
    ){
        this._idNorma = idNorma;
        this._codigoNorma = codigoNorma;
        this._tituloNorma = tituloNorma;
        this._descricaoNorma = descricaoNorma;
        this._dataPublicacaoNorma = dataPublicacaoNorma;
        this._revisaoNormaAtual = revisaoNormaAtual;
        this._revisaoNormaObsoleta = revisaoNormaObsoleta;
        this._statusNorma = statusNorma;
    }

    get idNorma(): number{
        return this._idNorma;
    }
}