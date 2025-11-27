import { createBar, getBars } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManageBars() {
    const bars = await getBars();

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)' }}>Bares</h1>
                <Link href="/admin" className="btn btn-secondary" style={{ width: 'auto' }}>Voltar</Link>
            </div>

            <Card title="Novo Bar" className="mb-8">
                <form action={createBar}>
                    <Input name="name" placeholder="Nome do Bar (ex: Bar da Piscina)" required />
                    <Button type="submit">Cadastrar Bar</Button>
                </form>
            </Card>

            <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Bares Cadastrados</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {bars.map((bar) => (
                    <Card key={bar.id}>
                        <h3>{bar.name}</h3>
                        <p style={{ color: '#888', fontSize: '0.8rem' }}>ID: {bar.id}</p>
                    </Card>
                ))}
                {bars.length === 0 && <p style={{ color: '#666' }}>Nenhum bar cadastrado.</p>}
            </div>
        </main>
    );
}
