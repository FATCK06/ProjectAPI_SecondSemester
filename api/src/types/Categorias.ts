export class Categoria {
    private _idCategoria: number;
    _nomeCategoria: string;
    _descricaoCategoria: string;

    constructor(idCategoria: number, nomeCategoria: string, descricaoCategoria: string){
        this._idCategoria = idCategoria;
        this._descricaoCategoria = descricaoCategoria;
        this._nomeCategoria = nomeCategoria;
    }

    get idCategoria(): number{
        return this._idCategoria;
    }
}