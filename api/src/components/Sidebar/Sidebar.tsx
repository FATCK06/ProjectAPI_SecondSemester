"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Home,
    Layers,
    Wrench,
    ClipboardList,
    PlusCircle,
    Users,
    UserCircle,
    LogOut,
    TextAlignJustify,
    ChevronDown,
    ChevronUp,
    Package,
    Blocks,
    Plug,
    BookMarked
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { supabase } from "@/services/supabase";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);
    
    // Estados para os dados do usuário
    const [userName, setUserName] = useState("Carregando...");
    const [userRole, setUserRole] = useState("");

    const pathname = usePathname();
    const router = useRouter();

    // Busca o usuário logado de forma reativa e à prova de falhas para a apresentação
    useEffect(() => {
        async function fetchUser() {
            try {
                // 1. Tenta buscar da sessão atual do Supabase
                const { data: { user } } = await supabase.auth.getUser();
                
                let query = supabase.from("tb_usuarios").select("nome_usuario, sobrenome_usuario, permissao_usuario");
                let shouldFetch = false;

                // 2. Se houver e-mail na sessão oficial, busca por ele
                if (user && user.email) {
                    query = query.ilike("email_usuario", user.email);
                    shouldFetch = true;
                } 
                // 3. Como vocês usam o login apenas por "Nome", buscamos pelo localStorage
                else if (typeof window !== "undefined") {
                    const localUsername = localStorage.getItem("nome_usuario");
                    if (localUsername) {
                        query = query.ilike("nome_usuario", localUsername);
                        shouldFetch = true;
                    }
                }

                // 4. Executa a busca EXATA (sem puxar ninguém aleatório!)
                if (shouldFetch) {
                    const { data } = await query.maybeSingle();

                    if (data) {
                        setUserName(`${data.nome_usuario} ${data.sobrenome_usuario || ''}`.trim());
                        setUserRole(
                            data.permissao_usuario === "ADMIN" ? "Administrador" : 
                            data.permissao_usuario === "REVISOR" ? "Revisor" : "Consultor"
                        );
                    } else {
                        setUserName("Usuário não encontrado");
                        setUserRole("");
                    }
                } else {
                    setUserName("Usuário");
                    setUserRole("");
                }
            } catch (error) {
                console.error("Erro ao buscar usuário:", error);
            }
        }

        // Verifica a sessão atual ao montar a Sidebar
        fetchUser();

        // Escuta mudanças na autenticação (atualiza na hora quando faz login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    }

    // Função de Logout (Limpando a sessão do Supabase e o Cache local)
    const handleLogout = async () => {
        await supabase.auth.signOut();
        if (typeof window !== "undefined") {
            localStorage.removeItem("nome_usuario"); 
        }
        router.push("/login"); // Redireciona e reseta a página
    }

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>

            {/* Estilos do Topo */}
            <div className={styles.header}>
                {!isCollapsed && (
                    <img src="/images/logo2.png" alt="Logo" className={styles.logo} />
                )}
                <button className={styles.menuIconButton} onClick={toggleSidebar}>
                    <TextAlignJustify size={20} color="#000000" />
                </button>
            </div>

            <hr className={styles.separator} />

            {/* Estilos da Navegação */}
            <nav className={styles.nav}>

                <Link href="/home" className={`${styles.navLink} ${pathname === "/home" ? styles.active : ""}`}>
                    <Home className={styles.linkIcon} size={20} />
                    {!isCollapsed && <span>Home</span>}
                </Link>

                <div className={`${styles.navLink} ${styles.categoryTitle}`} onClick={() => !isCollapsed && setIsCategoriasOpen(!isCategoriasOpen)}>
                    <div className={styles.categoryContent}>
                        <Layers className={styles.linkIcon} size={20} />
                        {!isCollapsed && <span>Categorias</span>}
                    </div>

                    {!isCollapsed && (
                        <div className={styles.categoryArrow}>
                            {isCategoriasOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    )}
                </div>

                <div className={`${styles.dropdownItems} ${isCategoriasOpen && !isCollapsed ? styles.open : ""}`}>
                    <Link href="/categorias/peca" className={`${styles.navLink} ${styles.subLink} ${pathname === "/categorias/peca" ? styles.active : ""}`}>
                        <Package className={styles.linkIcon} size={18} />
                        {!isCollapsed && <span>Peças</span>}
                    </Link>

                    <Link href="/categorias/conjunto" className={`${styles.navLink} ${styles.subLink} ${pathname === "/categorias/conjunto" ? styles.active : ""}`}>
                        <Blocks className={styles.linkIcon} size={18} />
                        {!isCollapsed && <span>Conjunto</span>}
                    </Link>

                    <Link href="/categorias/instalacoes" className={`${styles.navLink} ${styles.subLink} ${pathname === "/categorias/instalacoes" ? styles.active : ""}`}>
                        <Plug className={styles.linkIcon} size={18} />
                        {!isCollapsed && <span>Instalações</span>}
                    </Link>

                    <Link href="/categorias/geral" className={`${styles.navLink} ${styles.subLink} ${pathname === "/categorias/geral" ? styles.active : ""}`}>
                        <BookMarked className={styles.linkIcon} size={18} />
                        {!isCollapsed && <span>Geral</span>}
                    </Link>
                </div>

                <Link href="/cadastrar" className={`${styles.navLink} ${pathname === "/cadastrar" ? styles.active : ""}`}>
                    <PlusCircle className={styles.linkIcon} size={20} />
                    {!isCollapsed && <span>Cadastrar Normas</span>}
                </Link>

                <Link href="/solicitacoes" className={`${styles.navLink} ${pathname === "/solicitacoes" ? styles.active : ""}`}>
                    <ClipboardList className={styles.linkIcon} size={20} />
                    {!isCollapsed && <span>Solicitações de Normas</span>}
                </Link>

            </nav>

            <div className={styles.spacer}></div>

            {/* Estilos do Rodapé */}
            <div className={styles.footer}>

                <div style={{ padding: '0 16px 12px 16px' }}>
                    <Link href="/usuarios" className={`${styles.navLink} ${pathname === "/usuarios" ? styles.active : ""}`}>
                        <Users className={styles.linkIcon} size={20} />
                        {!isCollapsed && <span>Gerenciar Usuários</span>}
                    </Link>
                </div>

                <hr className={styles.separator} />

                {/* Container do Usuário Logado */}
                <div className={styles.userContainer}>
                    <UserCircle size={36} color="#000000" />

                    {!isCollapsed && (
                        <>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{userName}</span>
                                <span className={styles.userRole}>{userRole}</span>
                            </div>

                            <button className={styles.logoutBtn} onClick={handleLogout} title="Sair do sistema">
                                <LogOut size={20} color="#000000" />
                            </button>
                        </>
                    )}
                </div>

            </div>

        </aside>
    );
}