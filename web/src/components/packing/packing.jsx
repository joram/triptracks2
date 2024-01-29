import React, {useContext, useEffect} from "react";
import {useParams} from 'react-router-dom'
import {Button, Container, Dropdown, Icon, Input, Search, Segment, Table} from "semantic-ui-react";
import product_manifest from "./products_manifest.json";
import {handleApiErrors, url} from "../../utils/auth";
import {indexOf} from "lodash/array";
import {UserContext} from "../../App";

// HINTS:
// FOOD: On a typical day you will burn between 3,000 and 5,000 calories. Generally this amounts to about 1½ pounds of food. Your food weight distribution should optimally be around 55 to 65% carbohydrates, 15 to 20 % protein, and less than 25% fat.
// WEIGHT: max 20% body weight

function stringToGrams(s){
    let value = s.split(" ")[0];
    if(value.includes("kg")){
        return parseFloat(value.replace("kg", "")) * 1000
    } else if(value.includes("g")){
        return parseFloat(value.replace("g", ""))
    } else {
        console.log(`Unknown weight unit ${s}`)
    }
}

function stringToWeightString(grams){
    if(typeof grams === "string") {
        grams = stringToGrams(grams)
    }
    if(grams >= 1000){
        return `${grams/1000}kg`
    }
    return `${grams}g`
}
function productToWeightStrings(product){
    let weightString = "";
    if(product.weights.length > 0){
        weightString = product.weights[product.weightIndex].value;
    } else {
        weightString = product.customWeight+"g";
    }
    const totalWeight = stringToWeightString(stringToGrams(weightString)*product.quantity);
    return {weightString, totalWeight}
}

async function getPackingList(id){
  return fetch(url("/api/v0/packing_list/"+id), {
      method: "GET",
      headers: {
          'Content-Type': 'application/json',
      },
  }).then(response => {
      return response.json()
  }).then(response => {
      handleApiErrors(response)
      return response
  })
}


function ProductsTable({products, onRemoveItem, onAddItem, onChangeWeight, onChangeCustomWeight, onChangeQuantity, onChangeFriendlyName, onChangeInPack, sortItems}) {
    let newProducts = [];
    if (products === undefined) {
        return null
    }
    products.forEach(product => {
        if(product.quantity === undefined){
            product.quantity = 1;
        }
        if(product.weightIndex === undefined){
            product.weightIndex = 0;
        }
        if(product.friendlyName === undefined){
            product.friendlyName = product.title;
        }
        if(product.inPack === undefined){
            product.inPack = true;
        }
        newProducts.push(product);
    })
    products = newProducts;

    if(products.length === 0){
        return null
    }


    function ProductRow({product, onRemoveItem, onChangeWeight, onChangeCustomWeight, onChangeQuantity, onChangeFriendlyName, onChangeInPack}) {
        const quantity =product.quantity || 1;
        const friendlyName = product.friendlyName || product.title;

        const weightOptions = product.weights.map(weight => {
            return {
                key: weight.value,
                text: `${weight.key} (${weight.value})`,
                value: weight.value,
            }
        });
        const {weightString, totalWeight} = productToWeightStrings(product);


        let weightInput = <Dropdown
            placeholder='Select Weight Type'
            selection
            options={weightOptions}
            defaultValue={weightString}
            onChange={(e, {value}) => {
                const newIndex = product.weights.findIndex(weight => weight.value === value);
                onChangeWeight(product, newIndex);
            }}
        />
        if(product.weights.length === 0){
            weightInput = <Input
                type={"text"}
                value={product.customWeight}
                style={{
                    width: "100%",
                    marginLeft: "5px",
                    marginRight: "5px",
                }}
                onChange={(e) => {
                    onChangeCustomWeight(product, e.target.value)
                }}
            />
        }
        return <Table.Row>
            <Table.Cell>
                <Input
                    type={"text"}
                    value={friendlyName}
                    style={{
                        width: "100%",
                        marginLeft: "5px",
                        marginRight: "5px",
                    }}
                    onChange={(e) => {
                        onChangeFriendlyName(product, e.target.value)
                    }}
                />
            </Table.Cell>
            <Table.Cell>
                {weightInput}
            </Table.Cell>
            <Table.Cell>
                <Input
                    type="number"
                    value={quantity}
                    style={{
                        width: "55px",
                        marginLeft: "5px",
                        marginRight: "5px",
                    }}
                    onChange={(e) => {
                        onChangeQuantity(product, e.target.value)
                    }}
                />
            </Table.Cell>
            <Table.Cell>{totalWeight}</Table.Cell>
            <Table.Cell>
                <Input
                    type="checkbox"
                    checked={product.inPack}
                    onChange={(e) => {
                        onChangeInPack(product, e.target.checked)
                    }}
                />
            </Table.Cell>
            <Table.Cell>
                <Icon name="remove circle" onClick={(e) => {onRemoveItem(product)}}/>
            </Table.Cell>
        </Table.Row>
    }


    function SortableHeaderCell({column, direction, itemKey, collapsing}) {
        return <Table.HeaderCell
            collapsing={collapsing}
            sorted={null}
            onClick={() => sortItems({ type: 'CHANGE_SORT', column: itemKey || column })}
        >
            {column}
        </Table.HeaderCell>
    }

    return <Segment basic>
        <Table striped stackable sortable>
            <Table.Header>
                <Table.Row>
                    <SortableHeaderCell column={"Item"} itemKey={"friendlyName"} />
                    <SortableHeaderCell column={"Weight"} collapsing />
                    <SortableHeaderCell column={"Quantity"} collapsing />
                    <SortableHeaderCell column={"Total Weight"} collapsing />
                    <SortableHeaderCell column={"In Pack"} collapsing />
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {products.map(product => {return <ProductRow
                    key={"row_"+indexOf(products, product)}
                    product={product}
                    onRemoveItem={onRemoveItem}
                    onChangeWeight={onChangeWeight}
                    onChangeCustomWeight={onChangeCustomWeight}
                    onChangeQuantity={onChangeQuantity}
                    onChangeFriendlyName={onChangeFriendlyName}
                    onChangeInPack={onChangeInPack}
                /> })}
                <Table.Row>
                    <Table.Cell colSpan={6} textAlign="center">
                        <Button
                            icon="add"
                            label="Add Custom Item"
                            labelPosition='left'
                            onClick={() => {
                                onAddItem({
                                    title: "",
                                    weights: [],
                                    weightIndex: 0,
                                    quantity: 1,
                                    inPack: true,
                                });
                            }}
                            />
                    </Table.Cell>
                </Table.Row>

            </Table.Body>
        </Table>
    </Segment>
}


function ProductsSummaryTable({products}) {
    let packWeight = 0;
    let outOfPackWeight = 0;
    if (products !== undefined) {
        products.forEach(product => {
            if (product.weights.length === 0) {
                return
            }
            if(product.inPack){
                packWeight += product.quantity * stringToGrams(product.weights[product.weightIndex].value);
            } else {
                outOfPackWeight += product.quantity * stringToGrams(product.weights[product.weightIndex].value);
            }
        })
    }
    let totalWeight = packWeight + outOfPackWeight;
    totalWeight = stringToWeightString(totalWeight);
    packWeight = stringToWeightString(packWeight);
    outOfPackWeight = stringToWeightString(outOfPackWeight);

    return <Segment textAlign="center" basic>
        <Table striped collapsing textAlign="center" style={{margin:"auto"}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>In Pack</Table.HeaderCell>
                    <Table.HeaderCell>Out of Pack</Table.HeaderCell>
                    <Table.HeaderCell>Total Weight</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>{packWeight}</Table.Cell>
                    <Table.Cell>{outOfPackWeight}</Table.Cell>
                    <Table.Cell>{totalWeight}</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    </Segment>
}


function ReadOnlyProductsTable({products}) {
    return <Segment basic>
        <Table striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Item</Table.HeaderCell>
                    <Table.HeaderCell>Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Quantity</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Total Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>In Pack</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {products.map(product => {
                    const {weightString, totalWeight} = productToWeightStrings(product);
                    let inPack = "No";
                    if(product.inPack){
                        inPack = "Yes";
                    }
                    return <Table.Row key={"row_"+indexOf(products, product)}>
                        <Table.Cell>{product.friendlyName}</Table.Cell>
                        <Table.Cell>{weightString}</Table.Cell>
                        <Table.Cell>{product.quantity}</Table.Cell>
                        <Table.Cell>{totalWeight}</Table.Cell>
                        <Table.Cell>{inPack}</Table.Cell>
                    </Table.Row>
                })}
            </Table.Body>
        </Table>
    </Segment>
}

function Packing() {
    const { user, accessToken } = useContext(UserContext);
    let [name, setName] = React.useState("");
    let [ownerId, setOwnerId] = React.useState(undefined);
    let [searchText, setSearchText] = React.useState("");
    let [results, setResults] = React.useState([]);
    let [products, setProducts] = React.useState(undefined);
    let [loading, setLoading] = React.useState(false);
    let {id} = useParams()

    useEffect(() => {
        setLoading(true)
        getPackingList(id).then(packingList => {
            setName(packingList.name)
            setProducts(packingList.contents)
            setOwnerId(packingList.ownerId)
            setLoading(false)
        })
    }, [id]);

    function setPackingList(id, name, contents){
        if(contents === undefined){
            return
        }
        fetch(url("/api/v0/packing_list/"+id), {
              method: "POST",
              headers: {
                  'Content-Type': 'application/json',
                  'Access-Key': accessToken,
              },
              body: JSON.stringify({
                  name: name,
                  contents: contents,
              })
        })
    }

    useEffect(() => {
        if (loading) {
            return
        }
        if(products === undefined){
            return
        }
        setPackingList(id, name, products)
    }, [loading, id, products, name]);

    function sortItems({type, column}){
        console.log("sorting items", type, column)
        let newProducts = [...products];
        console.log(newProducts[0])
        newProducts.sort((a, b) => {
            const aValue = a[column];
            const bValue = b[column];
            console.log(aValue, bValue)
            if(aValue < bValue){
                return -1;
            }
            if(aValue > bValue){
                return 1;
            }
            return 0;
        })
        setProducts(newProducts)
    }

    function updateSearchResults(value){
        let results = [];
        product_manifest.forEach(product => {
            if(results.length >= 5){
                return;
            }
            const title = product.title.toLowerCase();
            const words = value.split(" ");
            let foundWords = []
            words.forEach(word => {
                foundWords.push(title.includes(word.toLowerCase()));
            })
            const show = foundWords.length > 0 && !foundWords.includes(false)
            if(show){
                results.push({
                    title: product.title,
                    image: product.image,
                    weights: product.weights,
                })
            }
        });
        setResults(results);
    }

    function onSearchChange(e){
        setSearchText(e.target.value)
        updateSearchResults(e.target.value);
    }

    function onResultSelect(e, {result}){
        const newProducts = [...products];
        newProducts.push(result);
        setProducts(newProducts);
        setSearchText("");
    }

    function onRemoveItem(product){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts.splice(index, 1);
        }
        setProducts(newProducts);
    }

    function onAddItem(product){
        const newProducts = [...products];
        newProducts.push(product);
        setProducts(newProducts);
    }

    function onChangeQuantity(product, quantity){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].quantity = quantity;
        }
        setProducts(newProducts);
    }

    function onChangeWeight(product, weightIndex){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].weightIndex = weightIndex;
        }
        setProducts(newProducts);
    }

    function onChangeCustomWeight(product, weight){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].customWeight = weight;
        }
        setProducts(newProducts);
    }

    function onChangeFriendlyName(product, friendlyName){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].friendlyName = friendlyName;
        }
        setProducts(newProducts);
    }

    function onChangeInPack(product, inPack){
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].inPack = inPack;
        }
        setProducts(newProducts);
    }

    function isOwner(){
        return user !== null && user != undefined && ownerId === user.id;
    }

    if (!isOwner()) {
        return <Container style={{paddingTop:"15px"}}>
            <Segment textAlign="center" basic>
                <h1>{name}</h1>
                <ReadOnlyProductsTable products={products || []} />
                <ProductsSummaryTable products={products || []} />
            </Segment>
        </Container>
    }


    return <Container style={{paddingTop:"15px"}}>
        <Input
            value={name}
            placeholder="placeholder name"
            onChange={(e) => {
                setName(e.target.value)
            }}
            size="huge"
            style={{width:"100%"}}
            label="Packing List Name"
        />

        <Segment textAlign="center" basic>
            <Search
                placeholder="Search for items to add"
                loading={false}
                onResultSelect={onResultSelect.bind(this)}
                onSearchChange={onSearchChange.bind(this)}
                results={results}
                value={searchText}
            />
        </Segment>

        <ProductsTable
            products={products}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            onChangeQuantity={onChangeQuantity}
            onChangeWeight={onChangeWeight}
            onChangeCustomWeight={onChangeCustomWeight}
            onChangeFriendlyName={onChangeFriendlyName}
            onChangeInPack={onChangeInPack}
            sortItems={sortItems}
        />
        <ProductsSummaryTable products={products} />
        <br/>
        <br/>
        <br/>n
    </Container>;
}

export default Packing;
