import React from "react";
import {Button, Header, Input, Segment, Table} from "semantic-ui-react";
import {RMap, RLayerVector, RFeature, RStyle, ROverlay} from "rlayers";
import {fromLonLat, toLonLat} from "ol/proj";
import Point from "ol/geom/Point";
import LayersControl from "../../../trails/LayersControl";

const DEFAULT_CENTER = [-124.594444, 49.223611];

// Place arbitrary points of interest (trailheads, campsites, water sources...)
// on the map. Stored on the plan as {lng, lat, label}.
export function PinsStep({pins, setPins, editable = true}) {
    pins = pins || [];

    const center = pins.length > 0 ? [pins[0].lng, pins[0].lat] : DEFAULT_CENTER;

    function addPin(lng, lat) {
        setPins([...pins, {lng, lat, label: `Pin ${pins.length + 1}`}]);
    }

    function updateLabel(index, label) {
        const newPins = pins.map((p, i) => (i === index ? {...p, label} : p));
        setPins(newPins);
    }

    function removePin(index) {
        setPins(pins.filter((_, i) => i !== index));
    }

    function onMapClick(e) {
        if (!editable) {
            return;
        }
        const [lng, lat] = toLonLat(e.coordinate);
        addPin(lng, lat);
    }

    return <>
        <Header size={"large"}>Pins</Header>
        <p>{editable ? "Click the map to drop a pin." : "Points of interest for this trip."}</p>
        <RMap
            width={"100%"}
            height={"400px"}
            initial={{center: fromLonLat(center), zoom: 10}}
            properties={{label: "HillShading"}}
            onClick={onMapClick}
        >
            <LayersControl/>
            <RLayerVector zIndex={10}>
                <RStyle.RStyle>
                    <RStyle.RCircle radius={7}>
                        <RStyle.RFill color={"#db2828"}/>
                        <RStyle.RStroke color={"#fff"} width={2}/>
                    </RStyle.RCircle>
                </RStyle.RStyle>
                {pins.map((pin, index) => (
                    <RFeature key={index} geometry={new Point(fromLonLat([pin.lng, pin.lat]))}>
                        <ROverlay className="pin-label">{pin.label}</ROverlay>
                    </RFeature>
                ))}
            </RLayerVector>
        </RMap>

        {pins.length > 0 && <Segment basic>
            <Table compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Label</Table.HeaderCell>
                        <Table.HeaderCell collapsing>Location</Table.HeaderCell>
                        {editable && <Table.HeaderCell collapsing/>}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {pins.map((pin, index) => (
                        <Table.Row key={index}>
                            <Table.Cell>
                                {editable
                                    ? <Input
                                        fluid
                                        value={pin.label}
                                        onChange={(e) => updateLabel(index, e.target.value)}
                                    />
                                    : pin.label}
                            </Table.Cell>
                            <Table.Cell>
                                {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                            </Table.Cell>
                            {editable && <Table.Cell>
                                <Button icon={"remove"} size={"tiny"} onClick={() => removePin(index)}/>
                            </Table.Cell>}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </Segment>}
    </>;
}

export default PinsStep;
