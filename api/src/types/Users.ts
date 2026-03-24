export class User {
    _nome: string;
    _sobrenome: string;
    _email: string;
    private _senha: string;
    _cargo: string;
    _data_criacao: Date;
    private _userId: number;

    constructor(
        data_criacao: Date,
        nome: string,
        sobrenome: string,
        email: string,
        senha: string,
        cargo: string,
        userId: number
    ){
        this._data_criacao = data_criacao;
        this._nome = nome;
        this._sobrenome  = sobrenome;
        this._email = email;
        this._cargo = cargo;
        this._senha =  senha;
        this._userId = userId;
    }

    get senha(): String{
        return  this._senha;
    }

    get id(): number{
        return this._userId;
    }
}