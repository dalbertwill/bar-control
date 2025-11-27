import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function AdminDashboard() {
    return (
        <main className="container">
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Painel do Dono</h1>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <Link href="/admin/bars">
                    <Card title="Gerenciar Bares">
                        <p style={{ color: '#888' }}>Cadastre seus pontos de venda.</p>
                    </Card>
                </Link>

                <Link href="/admin/ingredients">
                    <Card title="Gerenciar Insumos">
                        <p style={{ color: '#888' }}>Cadastre garrafas e insumos.</p>
                    </Card>
                </Link>

                <Link href="/admin/drinks">
                    <Card title="Fichas Técnicas">
                        <p style={{ color: '#888' }}>Crie receitas e defina preços.</p>
                    </Card>
                </Link>

                <Link href="/admin/reports">
                    <Card title="Relatórios">
                        <p style={{ color: '#888' }}>Veja o CMV e perdas.</p>
                    </Card>
                </Link>
            </div>

            <div style={{ marginTop: '2rem' }}>
                <Link href="/" style={{ color: '#888', textDecoration: 'underline' }}>Voltar ao Início</Link>
            </div>
        </main>
    );
}
