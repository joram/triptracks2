import React, {useEffect} from "react";
import {useParams} from 'react-router-dom'
import {Button, Container, Dropdown, Form, Icon, Input, Search, Segment, Table} from "semantic-ui-react";
import product_manifest from "./products_manifest.json";
import * as PropTypes from "prop-types";
import {handleApiErrors, url} from "../topNav";
import {getAccessKey, getUserInfo} from "../../utils/auth";


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

function setPackingList(id, name, contents){
    if(contents === undefined){
        return
    }
  return fetch(url("/api/v0/packing_list/"+id), {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
          'Access-Key': getAccessKey(),
      },
      body: JSON.stringify({
          name: name,
          contents: contents,
      })
  })
}

function ProductRow({product, onRemoveItem, onChangeWeight, onChangeQuantity, onChangeFriendlyName, onChangeInPack}) {
    console.log("adding row");
    console.log(product);

    const quantity =product.quantity || 1;
    const friendlyName = product.friendlyName || product.title;

    const weightOptions = product.weights.map(weight => {
        return {
            key: weight.value,
            text: `${weight.key} (${weight.value})`,
            value: weight.value,
        }
    });

    let weightString = "Unknown";
    if(product.weights.length > 0){
        weightString = product.weights[product.weightIndex].value;
    }
    const totalWeight = quantity * stringToGrams(weightString);
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
            <Dropdown
                placeholder='Select Weight Type'
                fluid
                selection
                options={weightOptions}
                defaultValue={weightString}
                onChange={(e, {value}) => {
                    const newIndex = product.weights.findIndex(weight => weight.value === value);
                    onChangeWeight(product, newIndex);
                }}
            />
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
        <Table.Cell>{totalWeight}g</Table.Cell>
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


function ProductsTable({products, onRemoveItem, onChangeWeight, onChangeQuantity, onChangeFriendlyName, onChangeInPack}) {
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

    return <Segment>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Item</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Quantity</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Total Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>In Pack</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {products.map(product => {return <ProductRow
                    key={product.title}
                    product={product}
                    onRemoveItem={onRemoveItem}
                    onChangeWeight={onChangeWeight}
                    onChangeQuantity={onChangeQuantity}
                    onChangeFriendlyName={onChangeFriendlyName}
                    onChangeInPack={onChangeInPack}
                /> })}
            </Table.Body>
        </Table>
    </Segment>
}


function ProductsSummaryTable({products}) {
    let packWeight = 0;
    let outOfPackWeight = 0;
    console.log("showing products", products)
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

    return <Segment textAlign="center" basic>
        <Table striped collapsing textAlign="center" style={{margin:"auto"}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>In Your Pack</Table.HeaderCell>
                    <Table.HeaderCell>Out of Your Pack</Table.HeaderCell>
                    <Table.HeaderCell>Total Weight</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>{packWeight}g</Table.Cell>
                    <Table.Cell>{outOfPackWeight}g</Table.Cell>
                    <Table.Cell>{packWeight+outOfPackWeight}g</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    </Segment>
}


function ReadOnlyProductsTable({products}) {
    return <Segment>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Item</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Quantity</Table.HeaderCell>
                    <Table.HeaderCell collapsing>Total Weight</Table.HeaderCell>
                    <Table.HeaderCell collapsing>In Pack</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {products.map(product => {
                    let weight = "Unknown";
                    let totalWeight = undefined;
                    if (product.weights.length > 0) {
                        const weightString = product.weights[product.weightIndex].value;
                        weight = stringToGrams(weightString);
                        totalWeight = product.quantity * weight;
                    }
                    console.log("in pack", product.inPack)
                    let inPack = "No";
                    if(product.inPack){
                        inPack = "Yes";
                    }
                    return <Table.Row key={product.title}>
                        <Table.Cell>{product.friendlyName}</Table.Cell>
                        <Table.Cell>{weight}g</Table.Cell>
                        <Table.Cell>{product.quantity}</Table.Cell>
                        <Table.Cell>{totalWeight}g</Table.Cell>
                        <Table.Cell>{inPack}</Table.Cell>
                    </Table.Row>
                })}
            </Table.Body>
        </Table>
    </Segment>
}

function Packing() {
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

    useEffect(() => {
        if (loading) {
            return
        }
        if(products === undefined){
            return
        }
        setPackingList(id, name, products).then(response => {
            console.log("response", response)
        })
    }, [products, name]);

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
        console.log("removing", product)
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts.splice(index, 1);
        }
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
        console.log("changing weight", product, weightIndex)
        const newProducts = [...products];
        const index = newProducts.indexOf(product);
        if(index > -1){
            newProducts[index].weightIndex = weightIndex;
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
        const userInfo = getUserInfo();
        return ownerId === userInfo.id;
    }

    if (getAccessKey() === undefined || !isOwner()) {
        return <Container style={{paddingTop:"15px"}}>
            <Segment textAlign="center" basic>
                <h1>{name}</h1>
                <ReadOnlyProductsTable products={products || []} />
                <ProductsSummaryTable products={products || []} />
            </Segment>
        </Container>
    }
    return <Container style={{paddingTop:"15px"}}>
        <Form>
            <Form.Field>
                <label>Name</label>
                <Input
                    value={name}
                    placeholder="Name"
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                />
            </Form.Field>

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
            <br/>

            <ProductsTable
                products={products}
                onRemoveItem={onRemoveItem}
                onChangeQuantity={onChangeQuantity}
                onChangeWeight={onChangeWeight}
                onChangeFriendlyName={onChangeFriendlyName}
                onChangeInPack={onChangeInPack}
            />
            <ProductsSummaryTable products={products} />
            <br/>

            <br/>
            <br/>

        </Form>
    </Container>;
}

export default Packing;