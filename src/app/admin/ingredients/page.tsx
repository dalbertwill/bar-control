import { createIngredient, getIngredients } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManageIngredients() {
    const ingredients = await getIngredients();

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)' }}>Insumos</h1>
                <Link href="/admin" className="btn btn-secondary" style={{ width: 'auto' }}>Voltar</Link>
            </div>

            <Card title="Novo Insumo" className="mb-8">
                <form action={createIngredient}>
                    <Input name="name" placeholder="Nome (ex: Vodka Absolut 1L)" required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Input name="unit" placeholder="Unidade (ml, g, un)" required />
                        <Input name="volume" type="number" step="0.01" placeholder="Volume Total" required />
                    </div>
                    <Input name="cost" type="number" step="0.01" placeholder="Custo (R$)" required />
                    <Button type="submit">Cadastrar Insumo</Button>
                </form>
            </Card>

            <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Insumos Cadastrados</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {ingredients.map((item) => (
                    <Card key={item.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3>{item.name}</h3>
                                <p style={{ color: '#888', fontSize: '0.9rem' }}>{item.volume}{item.unit}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>R$ {item.cost.toFixed(2)}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                {ingredients.length === 0 && <p style={{ color: '#666' }}>Nenhum insumo cadastrado.</p>}
            </div>
        </main>
    );
}
