import { GSP_NO_RETURNED_VALUE } from "next/dist/lib/constants";

export class PalavraChave {
    private _palavraChaveId: number;
    _termoPalavraChave: string;

    constructor(palavraChaveId: number, termoPalavraChave: string){
        this._palavraChaveId = palavraChaveId;
        this._termoPalavraChave = termoPalavraChave;
    }

    get palavraChaveId(): number{
        return  this._palavraChaveId;
    }
}