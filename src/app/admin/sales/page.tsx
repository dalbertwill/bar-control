import { addSale, getDrinks } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

async function getClosedShifts() {
    return await prisma.shift.findMany({
        where: { NOT: { endTime: null } },
        include: { bar: true },
        orderBy: { startTime: 'desc' },
        take: 10
    });
}

export default async function SalesPage() {
    const shifts = await getClosedShifts();
    const drinks = await getDrinks();

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)' }}>Lançar Vendas</h1>
                <Link href="/admin" className="btn btn-secondary" style={{ width: 'auto' }}>Voltar</Link>
            </div>

            <Card title="Adicionar Venda Manual">
                <form action={addSale}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Turno</label>
                        <select name="shiftId" className="input" required style={{ height: '48px' }}>
                            <option value="">Selecione o Turno...</option>
                            {shifts.map(shift => (
                                <option key={shift.id} value={shift.id}>
                                    {shift.bar.name} - {shift.startTime.toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Drink</label>
                        <select name="drinkId" className="input" required style={{ height: '48px' }}>
                            <option value="">Selecione o Drink...</option>
                            {drinks.map(drink => (
                                <option key={drink.id} value={drink.id}>{drink.name}</option>
                            ))}
                        </select>
                    </div>

                    <Input name="quantity" type="number" min="1" placeholder="Quantidade Vendida" required />

                    <Button type="submit">Registrar Venda</Button>
                </form>
            </Card>
        </main>
    );
}
