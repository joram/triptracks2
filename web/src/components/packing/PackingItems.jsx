import React, {useState} from "react";
import {formatWeight, itemGrams, packingTotals, quantityOf, unitGrams, withDefaults} from "./weights";
import "./packing.css";

export function PackingTotals({items}) {
    const {inPack, carried, total, unweighed, count} = packingTotals(items);
    return <div className="packing-totals">
        <dl>
            <div><dt>In pack</dt><dd>{formatWeight(inPack)}</dd></div>
            <div><dt>Worn or carried</dt><dd>{formatWeight(carried)}</dd></div>
            <div><dt>Total</dt><dd>{formatWeight(total)}</dd></div>
        </dl>
        <p className="packing-note">
            {count === 1 ? "1 item" : `${count} items`}
            {unweighed > 0 && `, ${unweighed} without a weight (not counted)`}
        </p>
    </div>;
}

const SORTS = {
    added: {label: "As added", compare: null},
    name: {label: "Name", compare: (a, b) => a.friendlyName.localeCompare(b.friendlyName)},
    heaviest: {label: "Heaviest first", compare: (a, b) => (itemGrams(b) ?? -1) - (itemGrams(a) ?? -1)},
};

function WeightField({item, onChange}) {
    if (item.weights.length > 1) {
        return <select
            aria-label="Variant"
            value={item.weightIndex}
            onChange={(e) => onChange({weightIndex: Number(e.target.value)})}
        >
            {item.weights.map((w, i) => <option key={i} value={i}>{w.key}: {w.value}</option>)}
        </select>;
    }
    if (item.weights.length === 1) {
        return <span className="packing-unit">{formatWeight(unitGrams(item))}</span>;
    }
    return <label className="packing-grams">
        <input
            type="number"
            min="0"
            inputMode="decimal"
            aria-label="Weight in grams"
            placeholder="Weight"
            value={item.customWeight ?? ""}
            onChange={(e) => onChange({customWeight: e.target.value})}
        />
        <span>g</span>
    </label>;
}

function EditableRow({item, onChange, onRemove}) {
    const grams = itemGrams(item);
    return <li className={item.inPack ? "packing-row" : "packing-row is-carried"}>
        <input
            type="checkbox"
            className="packing-check"
            aria-label="In pack"
            title="In pack (untick for worn or carried)"
            checked={item.inPack}
            onChange={(e) => onChange({inPack: e.target.checked})}
        />
        <input
            type="text"
            className="packing-name"
            aria-label="Item name"
            placeholder="Item name"
            value={item.friendlyName}
            onChange={(e) => onChange({friendlyName: e.target.value})}
        />
        <div className="packing-weight"><WeightField item={item} onChange={onChange}/></div>
        <label className="packing-qty">
            <span>×</span>
            <input
                type="number"
                min="1"
                aria-label="Quantity"
                value={item.quantity}
                onChange={(e) => onChange({quantity: e.target.value})}
            />
        </label>
        <span className={grams === null ? "packing-total is-missing" : "packing-total"}>
            {grams === null ? "No weight" : formatWeight(grams)}
        </span>
        <button type="button" className="packing-remove" aria-label={`Remove ${item.friendlyName || "item"}`} onClick={onRemove}>×</button>
    </li>;
}

function ReadOnlyRow({item}) {
    const grams = itemGrams(item);
    const quantity = quantityOf(item);
    return <li className={item.inPack ? "packing-row is-readonly" : "packing-row is-readonly is-carried"}>
        <span className="packing-name">
            {item.friendlyName || "Unnamed item"}
            {!item.inPack && <span className="packing-tag">Worn or carried</span>}
        </span>
        <span className="packing-weight">{quantity > 1 && `${quantity} × ${formatWeight(unitGrams(item))}`}</span>
        <span className={grams === null ? "packing-total is-missing" : "packing-total"}>
            {grams === null ? "No weight" : formatWeight(grams)}
        </span>
    </li>;
}

// A list of packing items with totals. When editable, onChange receives the new
// items array; sorting only changes the view, never the saved order.
export default function PackingItems({items, onChange, editable}) {
    const [sort, setSort] = useState("added");
    const normalized = (items || []).map(withDefaults);
    const rows = normalized.map((item, index) => ({item, index}));
    const compare = SORTS[sort].compare;
    if (compare) rows.sort((a, b) => compare(a.item, b.item));

    function update(index, patch) {
        onChange(normalized.map((item, i) => (i === index ? {...item, ...patch} : item)));
    }

    function remove(index) {
        onChange(normalized.filter((_, i) => i !== index));
    }

    return <section className="packing-items">
        <PackingTotals items={normalized}/>

        {normalized.length === 0
            ? <p className="packing-empty">
                {editable ? "Nothing here yet. Search for gear above, or add a custom item." : "This list is empty."}
            </p>
            : <>
                {normalized.length > 1 && <label className="packing-sort">
                    Sort by{" "}
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        {Object.entries(SORTS).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                    </select>
                </label>}
                <ul className={editable ? "packing-list is-editable" : "packing-list"}>
                    {rows.map(({item, index}) => editable
                        ? <EditableRow
                            key={index}
                            item={item}
                            onChange={(patch) => update(index, patch)}
                            onRemove={() => remove(index)}
                        />
                        : <ReadOnlyRow key={index} item={item}/>)}
                </ul>
            </>}
    </section>;
}
