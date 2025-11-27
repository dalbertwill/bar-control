import { getIngredients } from '@/app/actions';
import { Card } from '@/components/ui/Card';
import { CheckInForm } from '@/components/CheckInForm';
import Link from 'next/link';

export default async function CheckInPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ type: string }>
}) {
    const { id } = await params;
    const { type: typeParam } = await searchParams;
    const shiftId = parseInt(id);
    const type = typeParam || 'START';
    const ingredients = await getIngredients();

    return (
        <main className="container">
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>
                {type === 'START' ? 'Check-in de Garrafa' : 'Check-out de Garrafa'}
            </h1>

            <Card>
                <CheckInForm shiftId={shiftId} type={type} ingredients={ingredients} />
            </Card>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link href={`/bartender/shift/${shiftId}`} style={{ color: '#888' }}>Cancelar</Link>
            </div>
        </main>
    );
}
