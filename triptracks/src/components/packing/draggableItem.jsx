import { useDrag } from 'react-dnd';
import {Card, Image, Segment} from "semantic-ui-react";

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
    return (<Segment key={name} as={"div"} ref={drag} role="DraggableItem" style={{ opacity }} data-testid={`box-${name}`}>
            <Card>
            <Image src={image_url} wrapped ui={false} />
            <Card.Description>{name}</Card.Description>
            <Card.Meta>{weight}g</Card.Meta>
            </Card>
    </Segment>);
};