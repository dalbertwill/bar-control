import { createDrink, getDrinks } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default async function ManageDrinks() {
    const drinks = await getDrinks();

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)' }}>Fichas Técnicas</h1>
                <Link href="/admin" className="btn btn-secondary" style={{ width: 'auto' }}>Voltar</Link>
            </div>

            <Card title="Novo Drink" className="mb-8">
                <form action={createDrink}>
                    <Input name="name" placeholder="Nome do Drink (ex: Caipiroska)" required />
                    <Input name="price" type="number" step="0.01" placeholder="Preço de Venda (R$)" required />
                    <Button type="submit">Criar Drink</Button>
                </form>
            </Card>

            <h2 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Drinks Cadastrados</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {drinks.map((drink) => (
                    <Card key={drink.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>{drink.name}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>R$ {drink.price.toFixed(2)}</p>
                        </div>
                        <div style={{ marginTop: '1rem' }}>
                            <Button variant="secondary" style={{ fontSize: '0.8rem', padding: '0.5rem' }}>Editar Receita (Em breve)</Button>
                        </div>
                    </Card>
                ))}
                {drinks.length === 0 && <p style={{ color: '#666' }}>Nenhum drink cadastrado.</p>}
            </div>
        </main>
    );
}
