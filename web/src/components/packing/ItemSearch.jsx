import React, {useState} from "react";
import {Search} from "semantic-ui-react";
import {loadCatalog, searchCatalog} from "./catalog";
import {formatWeight, parseGrams} from "./weights";

// Search the gear catalog and add a product to the list, or add a custom item.
export default function ItemSearch({onAdd}) {
    const [catalog, setCatalog] = useState(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [query, setQuery] = useState("");

    function ensureCatalog() {
        if (catalog || loading) return;
        setLoading(true);
        setFailed(false);
        loadCatalog()
            .then(setCatalog)
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }

    const matches = catalog && query.trim().length >= 2 ? searchCatalog(catalog, query) : [];
    // Search spreads result fields onto DOM elements, so results carry only display
    // fields and are matched back to products by index.
    const results = matches.map((product, i) => {
        const grams = product.weights.length ? parseGrams(product.weights[0].value) : null;
        return {
            key: String(i),
            title: product.title,
            image: product.image || undefined,
            description: grams === null ? "No weight listed" : formatWeight(grams),
        };
    });

    return <div className="packing-add">
        <Search
            className="packing-search"
            fluid
            input={{fluid: true, icon: "search", iconPosition: "left", "aria-label": "Search gear to add"}}
            placeholder="Search gear to add, like “tent” or “stove”"
            loading={loading}
            value={query}
            results={results}
            showNoResults={Boolean(catalog) && query.trim().length >= 2}
            noResultsMessage="No gear matches that. Add it as a custom item instead."
            onFocus={ensureCatalog}
            onSearchChange={(e, data) => {
                ensureCatalog();
                setQuery(data.value);
            }}
            onResultSelect={(e, {result}) => {
                const {title, image, weights} = matches[Number(result.key)];
                onAdd({title, image, weights: weights || []});
                setQuery("");
            }}
        />
        <button
            type="button"
            className="packing-button-secondary"
            onClick={() => onAdd({title: "", weights: [], customWeight: ""})}
        >
            Add custom item
        </button>
        {failed && <p className="packing-note">The gear catalog didn't load. Add a custom item, or try searching again.</p>}
    </div>;
}
