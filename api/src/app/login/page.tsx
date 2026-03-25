import styles from "./page.module.css";

export default function LoginPage() {
    return <main className={styles.container}>

        <div className={styles.card}>

            <div className={styles.header}>
                <img src="/images/logo.png" alt="" />
                <h2>LOGIN</h2>
                <p>Seja bem vindo de volta</p>
            </div>

            <form className={styles.form}>
            <h2>Usuário ou E-mail:</h2>
            <input name="" id="" />
            
            <h2>Senha:</h2>
            <input type="password" name="" id="" />


            <button type="submit" >Conectar</button>
            </form>
        </div>
    </main>;
    
}