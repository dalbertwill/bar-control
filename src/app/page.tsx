import Link from 'next/link';

export default function Home() {
    return (
        <main className="container">
            <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>BarControl</h1>
                <p style={{ color: '#888' }}>Gestão de Estoque & CMV</p>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Acesso Rápido</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link href="/admin" className="btn btn-primary">
                        Área do Dono (Admin)
                    </Link>
                    <Link href="/bartender" className="btn" style={{ backgroundColor: 'var(--secondary)', color: 'var(--foreground)' }}>
                        Área do Bartender
                    </Link>
                </div>
            </div>
        </main>
    );
}
