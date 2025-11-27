import { endShift, getIngredients } from '@/app/actions';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ShiftPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const shiftId = parseInt(id);

    const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        include: {
            bar: true,
            checks: {
                include: { ingredient: true },
                orderBy: { createdAt: 'desc' }
            }
        },
    });

    if (!shift) {
        return <div>Turno não encontrado.</div>;
    }

    if (shift.endTime) {
        return (
            <main className="container">
                <Card title="Turno Finalizado">
                    <p>Este turno foi encerrado em {shift.endTime.toLocaleString()}.</p>
                    <Link href="/bartender" className="btn btn-primary mt-4">Voltar</Link>
                </Card>
            </main>
        );
    }

    async function handleEndShift() {
        'use server';
        await endShift(shiftId);
        redirect('/bartender');
    }

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>Turno: {shift.bar.name}</h1>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Início: {shift.startTime.toLocaleString()}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <Link href={`/bartender/shift/${shiftId}/check-in?type=START`} className="btn btn-primary">
                    Check-in (Início)
                </Link>
                <Link href={`/bartender/shift/${shiftId}/check-in?type=END`} className="btn btn-secondary">
                    Check-out (Fim)
                </Link>
            </div>

            <Card title="Registros do Turno">
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {shift.checks.map(check => (
                        <div key={check.id} style={{ padding: '0.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', color: check.type === 'START' ? '#4CAF50' : '#FF4500' }}>
                                    {check.type === 'START' ? 'ENTRADA' : 'SAÍDA'}
                                </span>
                                <span style={{ marginLeft: '0.5rem' }}>{check.ingredient.name}</span>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Garrafa: {check.bottleId}</div>
                            </div>
                            <div style={{ fontWeight: 'bold' }}>
                                {(check.level * 100).toFixed(0)}%
                            </div>
                        </div>
                    ))}
                    {shift.checks.length === 0 && <p style={{ color: '#666' }}>Nenhum registro ainda.</p>}
                </div>
            </Card>

            <div style={{ marginTop: '2rem' }}>
                <form action={handleEndShift}>
                    <Button type="submit" style={{ backgroundColor: '#FF4500', color: 'white' }}>Encerrar Turno</Button>
                </form>
            </div>
        </main>
    );
}
