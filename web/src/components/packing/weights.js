// Packing items come from the gear catalog ({title, image, weights: [{key, value}]})
// or are custom ({title: "", weights: [], customWeight}). Fields added by the editor:
// weightIndex, quantity, friendlyName, inPack.

const UNIT_GRAMS = {kg: 1000, g: 1, lb: 453.592, lbs: 453.592, oz: 28.3495};

// "23g (No colour SKU)" -> 23, "1.2 kg" -> 1200; null when there's no usable number.
export function parseGrams(value) {
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const match = String(value).match(/([\d.]+)\s*(kg|g|lbs?|oz)?\b/i);
    if (!match) return null;
    const amount = parseFloat(match[1]);
    if (!Number.isFinite(amount)) return null;
    return amount * (UNIT_GRAMS[(match[2] || "g").toLowerCase()] || 1);
}

export function withDefaults(item) {
    return {
        weights: [],
        weightIndex: 0,
        quantity: 1,
        inPack: true,
        ...item,
        friendlyName: item.friendlyName ?? item.title ?? "",
    };
}

export function quantityOf(item) {
    const quantity = parseInt(item.quantity, 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

// Weight of one of this item, in grams, or null if unknown.
export function unitGrams(item) {
    const weights = item.weights || [];
    if (weights.length > 0) {
        const chosen = weights[item.weightIndex || 0] || weights[0];
        return parseGrams(chosen.value);
    }
    return parseGrams(item.customWeight);
}

export function itemGrams(item) {
    const unit = unitGrams(item);
    return unit === null ? null : unit * quantityOf(item);
}

export function formatWeight(grams) {
    if (grams === null || grams === undefined) return "—";
    if (grams >= 1000) {
        return `${parseFloat((grams / 1000).toFixed(2))} kg`;
    }
    return `${Math.round(grams)} g`;
}

export function packingTotals(items) {
    let inPack = 0, carried = 0, unweighed = 0;
    (items || []).map(withDefaults).forEach((item) => {
        const grams = itemGrams(item);
        if (grams === null) {
            unweighed += 1;
        } else if (item.inPack) {
            inPack += grams;
        } else {
            carried += grams;
        }
    });
    return {inPack, carried, total: inPack + carried, unweighed, count: (items || []).length};
}
