// The gear catalog is ~17k products, so it's a static file fetched the first time
// someone searches, not part of the app bundle. Built by `make build_packing_catalog`.
let catalogPromise = null;

export function loadCatalog() {
    if (!catalogPromise) {
        catalogPromise = fetch("/packing.catalog.json")
            .then((response) => {
                if (!response.ok) throw new Error(`catalog failed: ${response.status}`);
                return response.json();
            })
            .catch((error) => {
                catalogPromise = null; // let the next search retry
                throw error;
            });
    }
    return catalogPromise;
}

// Products whose title contains every word of the query.
export function searchCatalog(catalog, query, limit = 8) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const results = [];
    for (const product of catalog) {
        const title = product.title.toLowerCase();
        if (words.every((w) => title.includes(w))) {
            results.push(product);
            if (results.length >= limit) break;
        }
    }
    return results;
}
