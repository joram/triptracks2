import {useDrag} from 'react-dnd';
import {Button, Card, Image} from "semantic-ui-react";

export const DraggableItem = function DraggableItem({ deletable, remove, name, image_url, weight }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "item",
        item: { name, image_url, weight },
        end: (item, monitor) => {},
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
            handlerId: monitor.getHandlerId(),
        }),
    }));
    const opacity = isDragging ? 0.4 : 1;

    let deleteButton = <></>
    if(deletable){
        deleteButton = <Button icon="delete" floated={"right"} onClick={()=>{remove()}}/>
    }
    return (
        <span ref={drag} style={{padding:"5px"}}>
            <Card key={name} role="DraggableItem" style={{ opacity }} data-testid={`box-${name}`} raised={true}>
                <Card.Content>
                    <Image src={image_url} style={{maxHeight:"200px"}}/>
                </Card.Content>
                <Card.Description>{name}</Card.Description>
                <Card.Meta>{weight}g</Card.Meta>
                {deleteButton}
            </Card>
        </span>
    );
};