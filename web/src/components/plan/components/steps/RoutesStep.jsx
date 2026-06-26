import React, {useEffect, useState} from "react";
import _ from "lodash";
import {Button, Header, List, Search, Segment} from "semantic-ui-react";
import {RMap, RLayerVector, RStyle} from "rlayers";
import GeoJSON from "ol/format/GeoJSON";
import {fromLonLat, transformExtent} from "ol/proj";
import Geohash from "latlon-geohash";
import LayersControl from "../../../trails/LayersControl";
import ClusteredTrails from "../../../trails/ClusteredTrails";

const DEFAULT_CENTER = [-124.594444, 49.223611];

function geohashFromUrl(url) {
    // search results look like "/trail/<geohash>"
    return url.split("/").filter(Boolean).pop();
}

function longestCommonPrefix(strs) {
    if (!strs || strs.length === 0) return "";
    let smallest = strs.reduce((min, str) => (min < str ? min : str), strs[0]);
    let largest = strs.reduce((max, str) => (max > str ? max : str), strs[0]);
    for (let i = 0; i < smallest.length; i++) {
        if (smallest[i] !== largest[i]) return smallest.substr(0, i);
    }
    return smallest;
}

// A single trail polyline that toggles plan membership when clicked.
function SelectableTrail({url, geohash, selected, onToggle}) {
    const [features, setFeatures] = useState(null);

    useEffect(() => {
        fetch(url)
            .then((r) => r.text())
            .then((text) => {
                setFeatures(new GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(text));
            })
            .catch(() => {});
    }, [url]);

    if (features === null) {
        return null;
    }

    return <RLayerVector
        zIndex={selected ? 8 : 5}
        features={features}
        onClick={(e) => {
            e.stopPropagation();
            onToggle(geohash);
        }}
    >
        <RStyle.RStyle>
            <RStyle.RStroke color={selected ? "#db2828" : "green"} width={selected ? 5 : 3}/>
        </RStyle.RStyle>
    </RLayerVector>;
}

function SelectableTrails({viewGeohash, maxTrails, selected, onToggle}) {
    const [manifest, setManifest] = useState(null);

    useEffect(() => {
        fetch("/trails.manifest.json")
            .then((r) => r.json())
            .then(setManifest)
            .catch(() => {});
    }, []);

    if (manifest === null || !viewGeohash) {
        return null;
    }

    let node = manifest;
    for (let i = 0; i < viewGeohash.length; i++) {
        node = node[viewGeohash.charAt(i)];
        if (node === undefined) {
            return null;
        }
    }

    function collect(node) {
        let trails = [];
        if (node.items !== undefined) {
            node.items.forEach((filename) => trails.push(`trails/${filename}`));
        }
        Object.keys(node).forEach((c) => {
            if (c !== "items") {
                trails = trails.concat(collect(node[c]));
            }
        });
        return trails;
    }

    let filenames = collect(node).slice(0, maxTrails);
    return filenames.map((filename, i) => {
        const geohash = filename.replace("trails/", "").replace(".geojson", "");
        return <SelectableTrail
            key={filename + "_" + i}
            url={"/" + filename}
            geohash={geohash}
            selected={selected.includes(geohash)}
            onToggle={onToggle}
        />;
    });
}

export function RoutesStep({trails, setTrails, editable = true}) {
    trails = trails || [];
    const [zoom, setZoom] = useState(10);
    const [viewGeohash, setViewGeohash] = useState("c2");
    const [titles, setTitles] = useState({});
    const [searchState, setSearchState] = useState({loading: false, results: [], value: ""});
    const searchSource = React.useRef([]);

    useEffect(() => {
        fetch("/trails.search.json")
            .then((r) => r.json())
            .then((data) => {
                searchSource.current = data;
                const map = {};
                data.forEach((d) => {
                    map[geohashFromUrl(d.url)] = d.title;
                });
                setTitles(map);
            })
            .catch(() => {});
    }, []);

    function toggleTrail(geohash) {
        if (!editable) {
            return;
        }
        if (trails.includes(geohash)) {
            setTrails(trails.filter((g) => g !== geohash));
        } else {
            setTrails([...trails, geohash]);
        }
    }

    function onMove(e) {
        const view = e.map.getView();
        const z = view.getZoom();
        if (z !== zoom) {
            setZoom(z);
        }
        const extent = view.calculateExtent(e.map.getSize());
        const bounds = transformExtent(extent, "EPSG:3857", "EPSG:4326");
        const match = longestCommonPrefix([
            Geohash.encode(bounds[1], bounds[0]),
            Geohash.encode(bounds[3], bounds[2]),
        ]);
        if (match !== viewGeohash) {
            setViewGeohash(match);
        }
    }

    function handleSearchChange(e, data) {
        const re = new RegExp(_.escapeRegExp(data.value), "i");
        setSearchState({
            loading: false,
            value: data.value,
            results: data.value.length === 0
                ? []
                : _.filter(searchSource.current, (r) => re.test(r.title)).slice(0, 8),
        });
    }

    return <>
        <Header size={"large"}>Routes</Header>
        {editable && <p>Search for a trail or click one on the map to add it to your trip.</p>}

        {editable && <Segment basic>
            <Search
                placeholder={"Search trails..."}
                loading={searchState.loading}
                value={searchState.value}
                results={searchState.results}
                onSearchChange={handleSearchChange}
                onResultSelect={(e, data) => {
                    toggleTrail(geohashFromUrl(data.result.url));
                    setSearchState({loading: false, results: [], value: ""});
                }}
            />
        </Segment>}

        <RMap
            width={"100%"}
            height={"400px"}
            initial={{center: fromLonLat(DEFAULT_CENTER), zoom: 10}}
            properties={{label: "HillShading"}}
            onMoveEnd={onMove}
        >
            <LayersControl/>
            {zoom < 10 && <ClusteredTrails maxZoom={9.9999}/>}
            {zoom >= 10 && <SelectableTrails
                viewGeohash={viewGeohash}
                maxTrails={100}
                selected={trails}
                onToggle={toggleTrail}
            />}
        </RMap>

        <Segment basic>
            <Header size={"small"}>Selected routes ({trails.length})</Header>
            {trails.length === 0
                ? <p>No routes selected yet.</p>
                : <List divided relaxed>
                    {trails.map((geohash) => (
                        <List.Item key={geohash}>
                            {editable && <List.Content floated={"right"}>
                                <Button icon={"remove"} size={"tiny"} onClick={() => toggleTrail(geohash)}/>
                            </List.Content>}
                            <List.Icon name={"map marker alternate"} verticalAlign={"middle"}/>
                            <List.Content>{titles[geohash] || geohash}</List.Content>
                        </List.Item>
                    ))}
                </List>}
        </Segment>
    </>;
}

export default RoutesStep;
