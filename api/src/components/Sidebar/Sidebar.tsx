"use client";

import { useState } from "react";
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
    Package,
    Blocks,
    Plug,
    BookMarked
} from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);

    return (
        <aside className={styles.sidebar}>

            {/* Estilos do Topo */}
            <div className={styles.header}>
                <img src="/images/logo2.png" alt="Logo" className={styles.logo} />
                <button className={styles.menuIconButton}>
                    <TextAlignJustify size={20} color="#000000" />
                </button>
            </div>

            <hr className={styles.separator} />

            {/* Estilos da Navegação */}
            <nav className={styles.nav}>

                <Link href="/home" className={styles.navLink}>
                    <Home className={styles.linkIcon} size={20} /> Home
                </Link>

                <div className={`${styles.navLink} ${styles.categoryTitle}`} onClick={() => setIsCategoriasOpen(!isCategoriasOpen)}>
                    <div className={styles.categoryContent}>
                        <Layers className={styles.linkIcon} size={20} /> Categorias
                    </div>
                    
                    <div className={styles.categoryArrow}>
                        {isCategoriasOpen ? <ChevronDown size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>

                <div className={`${styles.dropdownItems} ${isCategoriasOpen ? styles.open : ""}`}>
                    <Link href="/categorias/peca" className={`${styles.navLink} ${styles.subLink}`}>
                        <Package className={styles.linkIcon} size={18} /> Peças
                    </Link>

                    <Link href="/categorias/conjunto" className={`${styles.navLink} ${styles.subLink}`}>
                        <Blocks className={styles.linkIcon} size={18} /> Conjunto
                    </Link>

                    <Link href="/categorias/instalacoes" className={`${styles.navLink} ${styles.subLink}`}>
                        <Plug className={styles.linkIcon} size={18} /> Instalações
                    </Link>

                    <Link href="/categorias/geral" className={`${styles.navLink} ${styles.subLink}`}>
                        <BookMarked className={styles.linkIcon} size={18} /> Geral
                    </Link>
                </div>

                <Link href="/cadastrar" className={styles.navLink}>
                    <PlusCircle className={styles.linkIcon} size={20} /> Cadastrar Normas
                </Link>

                <Link href="/solicitacoes" className={styles.navLink}>
                    <ClipboardList className={styles.linkIcon} size={20} /> Solicitações de Normas
                </Link>

            </nav>

            <div className={styles.spacer}></div>

            {/* Estilos do Rodapé */}
            <div className={styles.footer}>

                <div style={{ padding: '0 16px 12px 16px' }}>
                    <Link href="/usuarios" className={styles.navLink}>
                        <Users className={styles.linkIcon} size={20} /> Gerenciar Usuários
                    </Link>
                </div>

                <hr className={styles.separator} />

                {/* Container do Usuário Logado */}
                <div className={styles.userContainer}>
                    <UserCircle size={36} color="#000000" />

                    <div className={styles.userInfo}>
                        <span className={styles.userName}>Neymar Martins</span>
                        <span className={styles.userRole}>Administrador</span>
                    </div>

                    <button className={styles.logoutBtn} title="Sair do sistema">
                        <LogOut size={20} color="#000000" />
                    </button>
                </div>

            </div>

        </aside>
    );
}