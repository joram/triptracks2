import React, {useEffect, useRef, useState} from "react";
import {Button, Header, List, Search, Segment} from "semantic-ui-react";
import {RMap} from "rlayers";
import {fromLonLat} from "ol/proj";
import {boundingExtent} from "ol/extent";
import Geohash from "latlon-geohash";
import LayersControl from "../../../trails/LayersControl";
import TrailClusters, {TRAILS_ZOOM} from "../../../trails/TrailClusters";
import Trails, {viewBbox} from "../../../trails/Trails";
import {getTrail, searchTrails} from "../../../../utils/api";

const DEFAULT_CENTER = [-124.594444, 49.223611];

// Collect map-projection points for the plan's routes (geohash centers) and
// pins, so the Routes map can frame everything when the step opens.
function collectPoints(trails, pins) {
    const points = [];
    (pins || []).forEach((p) => {
        if (p && typeof p.lng === "number" && typeof p.lat === "number") {
            points.push(fromLonLat([p.lng, p.lat]));
        }
    });
    (trails || []).forEach((geohash) => {
        try {
            const {lat, lon} = Geohash.decode(geohash);
            points.push(fromLonLat([lon, lat]));
        } catch (e) { /* skip unparseable geohash */ }
    });
    return points;
}

function geohashFromUrl(url) {
    // search results look like "/trail/<geohash>"
    return url.split("/").filter(Boolean).pop();
}

export function RoutesStep({trails, setTrails, pins = [], editable = true}) {
    trails = trails || [];
    const [zoom, setZoom] = useState(10);
    const [bbox, setBbox] = useState(null);
    const [titles, setTitles] = useState({});
    const [searchState, setSearchState] = useState({loading: false, results: [], value: ""});
    const searchTimeout = useRef();
    const mapRef = useRef();

    // On entering the step, frame the map around the existing routes + pins.
    useEffect(() => {
        const points = collectPoints(trails, pins);
        if (points.length === 0) {
            return;
        }
        const fit = () => {
            const map = mapRef.current && mapRef.current.ol;
            if (!map) {
                return;
            }
            map.getView().fit(boundingExtent(points), {
                padding: [60, 60, 60, 60],
                maxZoom: 13,
                duration: 250,
            });
        };
        // the map needs a tick to have a rendered size before fit() works
        const handle = setTimeout(fit, 60);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Look up titles for selected routes we haven't named yet.
    const trailsKey = trails.join(",");
    useEffect(() => {
        trails.filter((geohash) => titles[geohash] === undefined).forEach((geohash) => {
            getTrail(geohash)
                .then((trail) => setTitles((prev) => ({...prev, [geohash]: trail.title})))
                .catch(() => setTitles((prev) => ({...prev, [geohash]: null})));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trailsKey]);

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

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
        setBbox(viewBbox(e.map));
    }

    function handleSearchChange(e, data) {
        const value = data.value;
        clearTimeout(searchTimeout.current);
        if (value.trim().length < 2) {
            setSearchState({loading: false, value, results: []});
            return;
        }
        setSearchState((prev) => ({...prev, loading: true, value}));
        searchTimeout.current = setTimeout(() => {
            searchTrails(value.trim(), 8)
                .then((results) => {
                    setTitles((prev) => {
                        const next = {...prev};
                        results.forEach((r) => { next[geohashFromUrl(r.url)] = r.title; });
                        return next;
                    });
                    setSearchState((prev) => prev.value === value ? {...prev, loading: false, results} : prev);
                })
                .catch(() => setSearchState((prev) => ({...prev, loading: false})));
        }, 300);
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
            ref={mapRef}
            width={"100%"}
            height={"400px"}
            initial={{center: fromLonLat(DEFAULT_CENTER), zoom: 10}}
            properties={{label: "HillShading"}}
            onMoveEnd={onMove}
        >
            <LayersControl/>
            {zoom < TRAILS_ZOOM && <TrailClusters maxZoom={TRAILS_ZOOM}/>}
            {zoom >= TRAILS_ZOOM && <Trails
                bbox={bbox}
                maxTrails={100}
                selected={trails}
                onTrailClick={toggleTrail}
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
