import React from "react";
import {Button, Divider, Header, Icon, Input, Segment} from "semantic-ui-react";
import ItemSearch from "../../../packing/ItemSearch";
import PackingItems, {PackingTotals} from "../../../packing/PackingItems";

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

// Editor for a single packing group: name, search-to-add, items and weights.
function PackingGroup({group, onChange, onRemove, editable}) {
    const products = group.contents || [];

    function setContents(next) {
        onChange({...group, contents: next});
    }

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

        <div className="packing is-embedded">
            {editable && <ItemSearch onAdd={(item) => setContents([...products, item])}/>}
            <PackingItems items={products} editable={editable} onChange={setContents}/>
        </div>
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
            <Header size="small">Total across all lists</Header>
            <div className="packing is-embedded">
                <PackingTotals items={allProducts}/>
            </div>
        </Segment>}
    </>;
}

export default PackingStep;
