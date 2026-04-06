"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { verificarLogin } from "@/services/auth";

export default function LoginPage() {
    const router = useRouter();

    const [nomeUsuario, setNomeUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro("");

        const resultado = await verificarLogin(nomeUsuario, password);

        if (!resultado.sucesso) {
            setErro(resultado.mensagem || "Erro ao conectar. Tente novamente.");
            setLoading(false);
            return;
        }
        
        // NOVO: Guarda o nome do usuário no navegador para a Sidebar ler!
        if (typeof window !== "undefined") {
            localStorage.setItem("nome_usuario", nomeUsuario);
        }
        
        router.push("/home");
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <img src="/images/logo.png" alt="" />
                    <h2>LOGIN</h2>
                    <p>Seja bem vindo de volta</p>
                </div>

                {erro && <p style={{ color: "red", fontSize: "14px", textAlign: "center", marginBottom: "10px" }}>{erro}</p>}

                
                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="usuario">Nome de Usuário:</label>

                        <div className={styles.inputWrapper}>
                            <User className={styles.iconLeft} size={27} color="#75777A"></User>
                            <input 
                                type="text" 
                                id="usuario" 
                                placeholder="Insira seu nome de usuário" 
                                value={nomeUsuario}
                                onChange={(e) => setNomeUsuario(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="senha">Senha</label>

                        <div className={styles.inputWrapper}>
                            <Lock className={styles.iconLeft} size={26} color="#75777A" />
                            <input 
                                type={mostrarSenha ? "text" : "password"} 
                                id="senha" 
                                placeholder="Insira sua senha" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {mostrarSenha ? (
                                <EyeOff
                                    className={styles.iconRight}
                                    size={22}
                                    color="#75777A"
                                    onClick={() => setMostrarSenha(false)}
                                    style={{ cursor: 'pointer' }}
                                />
                            ) : (
                                <Eye
                                    className={styles.iconRight}
                                    size={22}
                                    color="#75777A"
                                    onClick={() => setMostrarSenha(true)}
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                        </div>
                    </div>

                    <div className={styles.btn}>
                        <button type="submit" disabled={loading}>
                            {loading ? "Conectando..." : "Conectar"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}