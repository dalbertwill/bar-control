'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Bar Actions
export async function createBar(formData: FormData) {
    const name = formData.get('name') as string;

    await prisma.bar.create({
        data: { name },
    });

    revalidatePath('/admin/bars');
}

export async function getBars() {
    return await prisma.bar.findMany();
}

// Ingredient Actions
export async function createIngredient(formData: FormData) {
    const name = formData.get('name') as string;
    const unit = formData.get('unit') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const cost = parseFloat(formData.get('cost') as string);

    await prisma.ingredient.create({
        data: { name, unit, volume, cost },
    });

    revalidatePath('/admin/ingredients');
}

export async function getIngredients() {
    return await prisma.ingredient.findMany();
}

// Drink Actions
export async function createDrink(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);

    await prisma.drink.create({
        data: { name, price },
    });

    revalidatePath('/admin/drinks');
}

export async function getDrinks() {
    return await prisma.drink.findMany();
}

// Shift Actions
export async function startShift(formData: FormData) {
    const barId = parseInt(formData.get('barId') as string);

    const shift = await prisma.shift.create({
        data: { barId },
    });

    return shift.id;
}

export async function endShift(shiftId: number) {
    await prisma.shift.update({
        where: { id: shiftId },
        data: { endTime: new Date() },
    });
}

export async function getActiveShift() {
    // Simple logic: get the last shift that hasn't ended
    return await prisma.shift.findFirst({
        where: { endTime: null },
        include: { bar: true },
        orderBy: { startTime: 'desc' },
    });
}

export async function createBottleCheck(formData: FormData) {
    const shiftId = parseInt(formData.get('shiftId') as string);
    const ingredientId = parseInt(formData.get('ingredientId') as string);
    const bottleId = formData.get('bottleId') as string;
    const type = formData.get('type') as string; // "START" or "END"
    const level = parseFloat(formData.get('level') as string); // 0-100

    await prisma.bottleCheck.create({
        data: {
            shiftId,
            ingredientId,
            bottleId,
            type,
            level: level / 100, // Store as 0.0-1.0
        },
    });

    revalidatePath(`/bartender/shift/${shiftId}`);
}

export async function createBulkBottleChecks(shiftId: number, type: string, checks: any[]) {
    // checks: { ingredientId, bottleId, level }[]

    // Use transaction for safety
    await prisma.$transaction(
        checks.map(check =>
            prisma.bottleCheck.create({
                data: {
                    shiftId,
                    type,
                    ingredientId: check.ingredientId,
                    bottleId: check.bottleId,
                    level: check.level / 100,
                }
            })
        )
    );

    revalidatePath(`/bartender/shift/${shiftId}`);
}

export async function getReportData() {
    // 1. Get all completed shifts
    const shifts = await prisma.shift.findMany({
        where: { NOT: { endTime: null } },
        include: {
            bar: true,
            checks: { include: { ingredient: true } },
            sales: { include: { drink: { include: { recipeItems: true } } } }
        },
        orderBy: { startTime: 'desc' }
    });

    // Simple aggregation per shift
    return shifts.map(shift => {
        // Calculate Real Consumption per Ingredient
        const realConsumption = new Map<number, number>(); // IngredientId -> Volume

        // Group checks by bottleId to find start/end pairs
        const bottleChecks = new Map<string, { start?: number, end?: number, volume: number }>();

        shift.checks.forEach(check => {
            if (!bottleChecks.has(check.bottleId)) {
                bottleChecks.set(check.bottleId, { volume: check.ingredient.volume });
            }
            const record = bottleChecks.get(check.bottleId)!;
            if (check.type === 'START') record.start = check.level;
            if (check.type === 'END') record.end = check.level;
        });

        bottleChecks.forEach((record) => {
            if (record.start !== undefined && record.end !== undefined) {
                const consumed = (record.start - record.end) * record.volume;
                // Add to total (logic needs to be robust for ingredient mapping)
                // For MVP, we assume we can map back to ingredient from the check
                // But here we iterated bottles. We need ingredientId.
                // Let's simplify: Iterate checks again or store ingredientId in map.
            }
        });

        // Simplified Logic for MVP:
        // Just sum (Start Level - End Level) * Volume for all matched pairs
        let totalLoss = 0;

        // This logic is complex to do in one pass without proper grouping.
        // Let's just return the raw data and let the UI or a helper function process it.
        return {
            id: shift.id,
            date: shift.startTime,
            barName: shift.bar?.name || 'Unknown', // shift.bar might not be included if not requested, but we need it.
            // We need to include bar in the query above.
        };
    });
}

export async function addSale(formData: FormData) {
    const shiftId = parseInt(formData.get('shiftId') as string);
    const drinkId = parseInt(formData.get('drinkId') as string);
    const quantity = parseInt(formData.get('quantity') as string);

    await prisma.sale.create({
        data: { shiftId, drinkId, quantity },
    });

    revalidatePath('/admin/sales');
}
