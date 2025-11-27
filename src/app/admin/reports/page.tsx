import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Helper to calculate consumption
async function getShiftReports() {
    const shifts = await prisma.shift.findMany({
        where: { NOT: { endTime: null } },
        include: {
            bar: true,
            checks: { include: { ingredient: true } },
            sales: { include: { drink: { include: { recipeItems: true } } } }
        },
        orderBy: { startTime: 'desc' }
    });

    return shifts.map(shift => {
        // 1. Real Consumption
        const consumption: Record<string, { real: number, theoretical: number, unit: string, cost: number }> = {};

        // Group checks by bottle
        const bottles: Record<string, { start: number, end: number, ingredient: any }> = {};

        shift.checks.forEach(check => {
            if (!bottles[check.bottleId]) {
                bottles[check.bottleId] = { start: 0, end: 0, ingredient: check.ingredient };
            }
            if (check.type === 'START') bottles[check.bottleId].start = check.level;
            if (check.type === 'END') bottles[check.bottleId].end = check.level;
        });

        Object.values(bottles).forEach(b => {
            const consumed = (b.start - b.end) * b.ingredient.volume;
            if (consumed > 0) {
                if (!consumption[b.ingredient.name]) {
                    consumption[b.ingredient.name] = { real: 0, theoretical: 0, unit: b.ingredient.unit, cost: b.ingredient.cost };
                }
                consumption[b.ingredient.name].real += consumed;
            }
        });

        // 2. Theoretical Consumption (from Sales)
        // Note: Sales implementation is missing in UI, so this will be 0 for now.
        // We would iterate shift.sales -> drink.recipeItems -> ingredient

        return {
            shift,
            consumption
        };
    });
}

export default async function ReportsPage() {
    const reports = await getShiftReports();

    return (
        <main className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)' }}>Relatórios de CMV</h1>
                <Link href="/admin" className="btn btn-secondary" style={{ width: 'auto' }}>Voltar</Link>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {reports.map((report) => (
                    <Card key={report.shift.id} title={`Turno: ${report.shift.bar.name} - ${report.shift.startTime.toLocaleDateString()}`}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Insumo</th>
                                        <th style={{ padding: '0.5rem' }}>Consumo Real</th>
                                        <th style={{ padding: '0.5rem' }}>Custo Real</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(report.consumption).map(([name, data]) => {
                                        const costReal = (data.real / 1000) * (data.cost / (1000 / 1000)); // Rough estimation if unit mismatch, but let's assume unit consistency for MVP
                                        // Actually: cost is per package. volume is package volume.
                                        // Cost per unit = cost / volume.
                                        // Total Cost = real * (cost / volume).
                                        // We don't have volume in 'data' easily accessible without passing it.
                                        // Let's just show volume for now.

                                        return (
                                            <tr key={name} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '0.5rem' }}>{name}</td>
                                                <td style={{ padding: '0.5rem' }}>{data.real.toFixed(0)} {data.unit}</td>
                                                <td style={{ padding: '0.5rem' }}>-</td>
                                                <td style={{ padding: '0.5rem', color: '#FF4500' }}>Verificar</td>
                                            </tr>
                                        );
                                    })}
                                    {Object.keys(report.consumption).length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>Sem dados de consumo.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ))}
                {reports.length === 0 && <p style={{ color: '#666' }}>Nenhum turno finalizado.</p>}
            </div>
        </main>
    );
}
