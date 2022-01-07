import {useDrag} from 'react-dnd';
import {Card, Image} from "semantic-ui-react";

export const DraggableItem = function DraggableItem({ name, image_url, weight }) {
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
    return (
        <span ref={drag} style={{padding:"5px"}}>
            <Card key={name} role="DraggableItem" style={{ opacity }} data-testid={`box-${name}`}>
                <Card.Content>
                    <Image src={image_url} style={{maxHeight:"200px"}}/>
                </Card.Content>
                <Card.Description>{name}</Card.Description>
                <Card.Meta>{weight}g</Card.Meta>
            </Card>
        </span>
    );
};