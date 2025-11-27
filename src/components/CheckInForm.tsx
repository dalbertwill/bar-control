'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createBottleCheck, createBulkBottleChecks } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface Ingredient {
    id: number;
    name: string;
}

interface CheckInFormProps {
    shiftId: number;
    type: string;
    ingredients: Ingredient[];
}

interface DetectedBottle {
    id: string; // temporary id for list key
    product_name: string;
    handwritten_id: string;
    level_percent: number;
    ingredientId: number | '';
}

export function CheckInForm({ shiftId, type, ingredients }: CheckInFormProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [detectedBottles, setDetectedBottles] = useState<DetectedBottle[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!preview) return;

        setLoading(true);
        try {
            const res = await fetch('/api/analyze-bottle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: preview }),
            });

            if (!res.ok) throw new Error('Failed to analyze');

            const data = await res.json();

            // Map API response to our state format
            if (data.bottles && Array.isArray(data.bottles)) {
                const newBottles = data.bottles.map((b: any, index: number) => ({
                    id: Date.now().toString() + index,
                    product_name: b.product_name,
                    handwritten_id: b.handwritten_id || '',
                    level_percent: b.level_percent || 0,
                    ingredientId: '', // User must select or we try to match by name later
                }));
                setDetectedBottles(newBottles);
            } else {
                alert('Nenhuma garrafa detectada ou formato inválido.');
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao analisar imagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const updateBottle = (index: number, field: keyof DetectedBottle, value: any) => {
        const newBottles = [...detectedBottles];
        newBottles[index] = { ...newBottles[index], [field]: value };
        setDetectedBottles(newBottles);
    };

    const removeBottle = (index: number) => {
        const newBottles = detectedBottles.filter((_, i) => i !== index);
        setDetectedBottles(newBottles);
    };

    const addManualBottle = () => {
        setDetectedBottles([...detectedBottles, {
            id: Date.now().toString(),
            product_name: 'Nova Garrafa',
            handwritten_id: '',
            level_percent: 100,
            ingredientId: '',
        }]);
    };

    const handleSaveAll = async () => {
        // Validate
        for (const b of detectedBottles) {
            if (!b.ingredientId) {
                alert(`Selecione o insumo para a garrafa "${b.product_name}"`);
                return;
            }
            if (!b.handwritten_id) {
                alert(`Informe o ID da garrafa "${b.product_name}"`);
                return;
            }
        }

        setLoading(true);
        try {
            const checks = detectedBottles.map(b => ({
                ingredientId: Number(b.ingredientId),
                bottleId: b.handwritten_id,
                level: b.level_percent
            }));

            await createBulkBottleChecks(shiftId, type, checks);
            router.push(`/bartender/shift/${shiftId}`);
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar registros.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Photo Upload Section */}
            <div style={{ marginBottom: '1rem' }}>
                <div style={{
                    border: '2px dashed #333',
                    borderRadius: '8px',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#1a1a1a',
                    position: 'relative'
                }}>
                    <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        id="photo-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {preview ? (
                        <div style={{ marginBottom: '1rem' }}>
                            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                        </div>
                    ) : (
                        <label htmlFor="photo-upload" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
                            <span style={{ color: 'var(--primary)' }}>Tirar Foto (Multi-Scan)</span>
                        </label>
                    )}

                    {preview && (
                        <Button
                            type="button"
                            onClick={analyzeImage}
                            disabled={loading}
                            style={{ marginTop: '1rem', backgroundColor: '#8A2BE2', color: 'white' }}
                        >
                            {loading ? 'Analisando...' : '✨ Ler Garrafas com IA'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid of Detected Bottles */}
            {detectedBottles.length > 0 && (
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    <h3 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                        Garrafas Detectadas ({detectedBottles.length})
                    </h3>

                    {detectedBottles.map((bottle, index) => (
                        <div key={bottle.id} style={{
                            backgroundColor: '#222',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #444'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: '#888', fontSize: '0.8rem' }}>Detectado: {bottle.product_name}</span>
                                <button
                                    onClick={() => removeBottle(index)}
                                    style={{ color: '#FF4500', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginBottom: '0.5rem' }}>
                                <select
                                    className="input"
                                    value={bottle.ingredientId}
                                    onChange={(e) => updateBottle(index, 'ingredientId', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="">Selecione a Bebida...</option>
                                    {ingredients.map(ing => (
                                        <option key={ing.id} value={ing.id}>{ing.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Input
                                    placeholder="ID"
                                    value={bottle.handwritten_id}
                                    onChange={(e) => updateBottle(index, 'handwritten_id', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={bottle.level_percent}
                                        onChange={(e) => updateBottle(index, 'level_percent', parseInt(e.target.value))}
                                        style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff' }}
                                    />
                                    <span style={{ color: '#888' }}>%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <Button type="button" onClick={addManualBottle} style={{ backgroundColor: '#333' }}>
                    + Adicionar Manualmente
                </Button>

                {detectedBottles.length > 0 && (
                    <Button type="button" onClick={handleSaveAll} disabled={loading}>
                        {loading ? 'Salvando...' : `Salvar ${detectedBottles.length} Garrafas`}
                    </Button>
                )}
            </div>
        </div>
    );
}
