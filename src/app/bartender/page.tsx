import { getBars, startShift, getActiveShift } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

export default async function BartenderDashboard() {
    const activeShift = await getActiveShift();

    if (activeShift) {
        redirect(`/bartender/shift/${activeShift.id}`);
    }

    const bars = await getBars();

    async function handleStartShift(formData: FormData) {
        'use server';
        const id = await startShift(formData);
        redirect(`/bartender/shift/${id}`);
    }

    return (
        <main className="container">
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Área do Bartender</h1>

            <Card title="Iniciar Turno">
                <p style={{ marginBottom: '1rem', color: '#888' }}>Selecione o bar para iniciar seu turno.</p>
                <form action={handleStartShift}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Bar</label>
                        <select
                            name="barId"
                            className="input"
                            required
                            style={{ height: '48px' }}
                        >
                            <option value="">Selecione...</option>
                            {bars.map(bar => (
                                <option key={bar.id} value={bar.id}>{bar.name}</option>
                            ))}
                        </select>
                    </div>
                    <Button type="submit">Abrir Turno</Button>
                </form>
            </Card>
        </main>
    );
}
