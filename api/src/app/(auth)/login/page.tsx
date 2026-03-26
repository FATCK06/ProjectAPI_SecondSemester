"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [mostrarSenha, setMostrarSenha] = useState(false);

    return <main className={styles.container}>

        <div className={styles.card}>

            <div className={styles.header}>
                <img src="/images/logo.png" alt="" />
                <h2>LOGIN</h2>
                <p>Seja bem vindo de volta</p>
            </div>


            <form className={styles.form}>

                <div className={styles.inputGroup}>
                    <label htmlFor="usuario">Nome de Usuário:</label>

                    <div className={styles.inputWrapper}>
                        <User className={styles.iconLeft} size={27} color="#75777A"></User>
                        <input name="text" id="usuario" placeholder="Insira seu nome de usuário" />
                    </div>

                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="senha">Senha</label>

                    <div className={styles.inputWrapper}>
                        <Lock className={styles.iconLeft} size={26} color="#75777A" />
                        <input type={mostrarSenha ? "text" : "password"} placeholder="Insira sua senha" id="senha" name="senha" />
                        {mostrarSenha ? (
                            <EyeOff
                                className={styles.iconRight}
                                size={22}
                                color="#75777A"
                                onClick={() => setMostrarSenha(false)}
                            />
                        ) : (
                            <Eye
                                className={styles.iconRight}
                                size={22}
                                color="#75777A"
                                onClick={() => setMostrarSenha(true)}
                            />
                        )}
                    </div>

                </div>

                <div className={styles.btn}>
                    <button type="submit">Conectar</button>
                </div>

            </form>
        </div>
    </main>;

}