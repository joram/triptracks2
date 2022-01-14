import React, {memo, useState} from 'react';
import {useDrop} from 'react-dnd';
import {DraggableItem} from "./draggableItem";
import {url} from "../topNav";
import {AccessKeyContext} from "../../context";
import {CardGroup} from "semantic-ui-react";



function DraggableTarget(props) {

    function getTotalWeight(){
        if(props.items===undefined)
            return 0
        let total = 0
        props.items.forEach(item => {
            total += item.weight
        })
        return total
    }

    function removeItem(i, id, name){
        items.splice(i, 1)
        return setPackingList(id, name, items)
    }

    function setPackingList(id, name){
      let body = {
          name: name,
          contents: items,
      }
      let accessKey = AccessKeyContext.accessKey
      return fetch(url("/api/v0/packing_list/"+id), {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'Access-Key': accessKey,
          },
          body: JSON.stringify(body)
      })
    }

    let [refresh, setRefresh] = useState(1)
    let [items, setItems] = useState([])
    if(items!==props.items && props.items !== undefined){
        setItems(props.items)
    }
    function droppedOnMe(propss, monitor, component){
        items.push(monitor.getItem())
        setPackingList(props.id, props.name)
    }

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: "item",
        drop: droppedOnMe,
        collect: (monitor) => {
            return {
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }
        }
    });

    const isActive = isOver && canDrop;
    let backgroundColor = '';
    if (isActive) { backgroundColor = 'green' }
    else if (canDrop) { backgroundColor = 'darkkhaki' }

    let itemCards = [];
    items.map((item, i) => {
        return itemCards.push(<DraggableItem
            remove={()=>{
                removeItem(i, props.id, props.name).then(r => setRefresh(refresh+1))
            }}
            key={i}
            name={item.name}
            weight={item.weight}
            deletable={true}
            image_url={item.image_url}
        />)
    })

    return (<div ref={drop} role={DraggableTarget} style={{width:"100%", backgroundColor:backgroundColor}}>
                <div style={{paddingBottom:"10px"}}>total weight is {getTotalWeight(props.name)}g</div>
            <CardGroup itemsPerRow={4}>{itemCards}</CardGroup>
        </div>
    );
}

export default memo(DraggableTarget);