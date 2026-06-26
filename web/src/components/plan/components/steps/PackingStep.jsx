import React, {useState} from "react";
import {Button, Divider, Header, Icon, Input, Search, Segment} from "semantic-ui-react";
import product_manifest from "../../../packing/products_manifest.json";
import {ProductsTable, ProductsSummaryTable} from "../../../packing/packing";

// A plan's packing is a list of named groups: [{name, contents:[product...]}].
// Older plans stored a flat array of products; wrap those in one group.
function normalizeGroups(packing) {
    if (!Array.isArray(packing) || packing.length === 0) {
        return [];
    }
    const looksLikeGroups = packing.every(
        (entry) => entry && typeof entry === "object" && Array.isArray(entry.contents)
    );
    if (looksLikeGroups) {
        return packing;
    }
    return [{name: "Packing list", contents: packing}];
}

// Editor for a single packing group: name, search-to-add, item table, weights.
function PackingGroup({group, onChange, onRemove, editable}) {
    const products = group.contents || [];
    const [searchText, setSearchText] = useState("");
    const [results, setResults] = useState([]);
    const [sortByColumn, setSortByColumn] = useState("Item");
    const [sortOrder, setSortOrder] = useState("ascending");

    function setContents(next) {
        onChange({...group, contents: next});
    }

    function mutate(fn) {
        const next = [...products];
        fn(next);
        setContents(next);
    }

    function updateSearchResults(value) {
        const found = [];
        const words = value.toLowerCase().split(" ");
        product_manifest.forEach((product) => {
            if (found.length >= 5) {
                return;
            }
            const title = product.title.toLowerCase();
            if (words.every((w) => title.includes(w))) {
                found.push({title: product.title, image: product.image, weights: product.weights});
            }
        });
        setResults(found);
    }

    function sortItems({column}) {
        let order = sortOrder;
        if (sortByColumn === column) {
            order = sortOrder === "ascending" ? "descending" : "ascending";
            setSortOrder(order);
        }
        const next = [...products].sort((a, b) => {
            if (a[column] < b[column]) return -1;
            if (a[column] > b[column]) return 1;
            return 0;
        });
        if (order === "descending") {
            next.reverse();
        }
        setContents(next);
        setSortByColumn(column);
    }

    const tableProps = {
        products,
        sortByColumn,
        sortOrder,
        sortItems: editable ? sortItems : () => {},
        onRemoveItem: (product) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next.splice(i, 1);
        }),
        onAddItem: (product) => mutate((next) => next.push(product)),
        onChangeQuantity: (product, quantity) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next[i] = {...next[i], quantity};
        }),
        onChangeWeight: (product, weightIndex) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next[i] = {...next[i], weightIndex};
        }),
        onChangeCustomWeight: (product, customWeight) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next[i] = {...next[i], customWeight};
        }),
        onChangeFriendlyName: (product, friendlyName) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next[i] = {...next[i], friendlyName};
        }),
        onChangeInPack: (product, inPack) => mutate((next) => {
            const i = next.indexOf(product);
            if (i > -1) next[i] = {...next[i], inPack};
        }),
    };

    return <Segment>
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
            {editable
                ? <Input
                    value={group.name || ""}
                    placeholder="List name"
                    size="large"
                    style={{flex: 1}}
                    onChange={(e) => onChange({...group, name: e.target.value})}
                />
                : <Header size="medium" style={{flex: 1, margin: 0}}>{group.name || "Packing list"}</Header>}
            {editable && <Button icon labelPosition="left" size="tiny" color="red" basic onClick={onRemove}>
                <Icon name="trash"/> Remove list
            </Button>}
        </div>

        {editable && <Segment basic textAlign="center">
            <Search
                placeholder="Search for items to add"
                loading={false}
                onResultSelect={(e, {result}) => {
                    mutate((next) => next.push({...result}));
                    setSearchText("");
                    setResults([]);
                }}
                onSearchChange={(e) => {
                    setSearchText(e.target.value);
                    updateSearchResults(e.target.value);
                }}
                results={results}
                value={searchText}
            />
        </Segment>}

        <ProductsTable {...tableProps}/>
        <ProductsSummaryTable products={products}/>
    </Segment>;
}

export function PackingStep({packing, setPacking, editable = true}) {
    const groups = normalizeGroups(packing);

    function setGroup(index, next) {
        setPacking(groups.map((g, i) => (i === index ? next : g)));
    }

    function removeGroup(index) {
        setPacking(groups.filter((_, i) => i !== index));
    }

    function addGroup() {
        setPacking([...groups, {name: `Packing list ${groups.length + 1}`, contents: []}]);
    }

    const allProducts = groups.reduce((acc, g) => acc.concat(g.contents || []), []);

    return <>
        <Header size={"large"}>Packing</Header>
        {editable && <p>Organize gear into separate lists — e.g. shelter, kitchen, or per person.</p>}

        {groups.length === 0 && <Segment basic>
            <p>No packing lists yet.</p>
        </Segment>}

        {groups.map((group, index) => (
            <PackingGroup
                key={index}
                group={group}
                editable={editable}
                onChange={(next) => setGroup(index, next)}
                onRemove={() => removeGroup(index)}
            />
        ))}

        {editable && <Segment basic textAlign="center">
            <Button icon labelPosition="left" onClick={addGroup}>
                <Icon name="add"/> Add packing list
            </Button>
        </Segment>}

        {groups.length > 1 && <Segment basic>
            <Divider/>
            <Header size="small" textAlign="center">Total across all lists</Header>
            <ProductsSummaryTable products={allProducts}/>
        </Segment>}
    </>;
}

export default PackingStep;
