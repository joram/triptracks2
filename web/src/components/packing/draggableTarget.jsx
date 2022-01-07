import React, {memo} from 'react';
import {useDrop} from 'react-dnd';
import {DraggableItem} from "./draggableItem";
import {getAccessKey, url} from "../topNav";

const items = {};

export function getTotalWeight(key){
    if(items[key]===undefined)
        return 0
    let total = 0
    items[key].forEach(item => {
        total += item.weight
    })
    return total
}

export function getItemCount(key){
    if(items[key]===undefined)
        return 0
    return items[key].length
}

function setPackingList(name, items){
  let body = {
      name: name,
      items: items,
  }
  fetch(url("/api/v0/packing_list"), {
      method: "POST",
      headers: {
          'Content-Type': 'application/json',
          'Access-Key': getAccessKey(),
      },
      body: body
  })
}

function DraggableTarget(props) {
    function droppedOnMe(propss, monitor, component){
        if(items[props.name]===undefined){
            items[props.name] = []
        }
        items[props.name].push(monitor.getItem())
        setPackingList(props.name, items[props.name])
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
    if(items[props.name]===undefined){
        items[props.name] = []
    }
    if(props.items !== undefined && props.items.items !== undefined){
        items[props.name] = props.items.items
    }

    items[props.name].forEach(item => {
        itemCards.push(<DraggableItem key={item.name} name={item.name} weight={item.weight} image_url={item.image_url}/>)
    })

    return (<div ref={drop} role={DraggableTarget} style={{width:"100%", height:"80vh", backgroundColor:backgroundColor}}>
			{isActive ? 'Release to drop' : ``}
        total weight is {getTotalWeight(props.name)}g
        {itemCards}
		</div>);
}

export default memo(DraggableTarget);