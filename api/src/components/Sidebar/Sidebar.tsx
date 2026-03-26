import Link from "next/link";
import styles from "./Sidebar.module.css";
import { Home, Users, FileText, Menu, CircleUserRound, LogOut } from "lucide-react";

export function Sidebar() {
    const usuario = {
        nome: "Carlos Alberto",
        cargo: "Consultor"
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <img src="/images/logo.png" alt="Akaer Log" className={styles.logo} />
                <button className={styles.menuIconButton}>
                    <Menu size={24} color="#333"></Menu>
                </button>
            </div>

            <hr className={styles.separator} />

            {/* navegação*/}
            <nav className={styles.nav}>
                <Link href="/dashboard" className={`${styles.navLink} ${styles.active}`}>
                    <Home size={22} className={styles.linkIcon} />
                    <span>Home</span>
                </Link>

                <Link href="/normas" className={styles.navLink}>
                    <FileText size={22} className={styles.linkIcon} />
                    <span>Normas</span>
                </Link>
            </nav>

            <div className={styles.spacer}></div>

            
            <footer className={styles.footer}>
                <hr className={styles.separator} />

                <div className={styles.userContainer}>
                   
                    <CircleUserRound size={40} color="#ccc" strokeWidth={1} />

                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{usuario.nome}</span>
                        <span className={styles.userRole}>{usuario.cargo}</span>
                    </div>

                    
                    <Link href="/login" className={styles.logoutBtn}>
                        <LogOut size={20} color="#333" />
                    </Link>
                </div>
            </footer>

        </aside>
    )
}