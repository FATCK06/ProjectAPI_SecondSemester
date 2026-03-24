export class Orgao{
    private _idOrgao: number;
    _siglaOrgao: string;
    _nomeCompletoOrgao: string;

    constructor(idOrgao: number, siglaOrgao: string, nomeCompletoOrgao: string){
        this._idOrgao = idOrgao;
        this._siglaOrgao = siglaOrgao;
        this._nomeCompletoOrgao = nomeCompletoOrgao;
    }

    get idOrgao(): number{
        return this._idOrgao;
    }

}