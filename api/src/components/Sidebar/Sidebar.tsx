"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);

    const pathname = usePathname();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
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
                                <span className={styles.userName}>Neymar Martins</span>
                                <span className={styles.userRole}>Administrador</span>
                            </div>

                            <button className={styles.logoutBtn} title="Sair do sistema">
                                <LogOut size={20} color="#000000" />
                            </button>
                        </>
                    )}
                </div>

            {/* 3. CORRIGIDO: A </div> extra que estava aqui foi removida! */}
            </div>

        </aside>
    );
}