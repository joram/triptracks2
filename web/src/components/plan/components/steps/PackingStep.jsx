import React, {useState} from "react";
import {Header, Search, Segment} from "semantic-ui-react";
import product_manifest from "../../../packing/products_manifest.json";
import {ProductsTable, ProductsSummaryTable} from "../../../packing/packing";

// Edit the plan's packing list inline. `packing` is an array of product
// objects, stored on the trip plan's packing_lists field.
export function PackingStep({packing, setPacking, editable = true}) {
    const products = packing || [];
    const [searchText, setSearchText] = useState("");
    const [results, setResults] = useState([]);
    const [sortByColumn, setSortByColumn] = useState("Item");
    const [sortOrder, setSortOrder] = useState("ascending");

    function mutate(fn) {
        const next = [...products];
        fn(next);
        setPacking(next);
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
        setPacking(next);
        setSortByColumn(column);
    }

    if (!editable) {
        return <>
            <Header size={"large"}>Packing</Header>
            <ProductsTable products={products} sortItems={() => {}}
                           onRemoveItem={() => {}} onAddItem={() => {}} onChangeWeight={() => {}}
                           onChangeCustomWeight={() => {}} onChangeQuantity={() => {}}
                           onChangeFriendlyName={() => {}} onChangeInPack={() => {}}
                           sortByColumn={sortByColumn} sortOrder={sortOrder}/>
            <ProductsSummaryTable products={products}/>
        </>;
    }

    return <>
        <Header size={"large"}>Packing</Header>
        <Segment textAlign="center" basic>
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
        </Segment>

        <ProductsTable
            products={products}
            sortByColumn={sortByColumn}
            sortOrder={sortOrder}
            sortItems={sortItems}
            onRemoveItem={(product) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next.splice(i, 1);
            })}
            onAddItem={(product) => mutate((next) => next.push(product))}
            onChangeQuantity={(product, quantity) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next[i] = {...next[i], quantity};
            })}
            onChangeWeight={(product, weightIndex) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next[i] = {...next[i], weightIndex};
            })}
            onChangeCustomWeight={(product, customWeight) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next[i] = {...next[i], customWeight};
            })}
            onChangeFriendlyName={(product, friendlyName) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next[i] = {...next[i], friendlyName};
            })}
            onChangeInPack={(product, inPack) => mutate((next) => {
                const i = next.indexOf(product);
                if (i > -1) next[i] = {...next[i], inPack};
            })}
        />
        <ProductsSummaryTable products={products}/>
    </>;
}

export default PackingStep;
