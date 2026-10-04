import React, {useContext, useEffect, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {Button, Dropdown, Modal} from "semantic-ui-react";
import {toast} from "react-toastify";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {fromLonLat} from "ol/proj";
import "ol/ol.css";
import {RLayerVector, RMap, RStyle} from "rlayers";
import {getPlan, getPlans, getTrail, getTrailGeojson, updatePlan} from "../../utils/api";
import {UserContext} from "../../App";
import LayersControl from "./LayersControl";
import PhotoStrip from "./PhotoStrip";
import {TRAIL_COLOR, TrailStyle} from "./Trails";
import "./TrailDetails.css";

// Stats come from two scrapers with different keys (trailpeak trail pages and
// peakbagger ascent logs), so each fact checks the keys either source uses.
function statValue(stats, keys) {
    for (const key of keys) {
        const value = stats[key];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return String(value).trim();
        }
    }
    return null;
}

// "7756 ft / 2364 m" -> "2364 m"
function metric(value) {
    if (!value) return null;
    const metricPart = value.split("/").map((p) => p.trim()).find((p) => /\d\s*k?m$/.test(p));
    return metricPart || value;
}

function sentenceCase(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ") : null;
}

function trailFacts(stats) {
    return [
        {label: "Distance", value: metric(statValue(stats, ["Total Distance", "Round-Trip Distance", "Distance"]))},
        {label: "Time", value: statValue(stats, ["Time"])},
        {label: "Elevation gain", value: metric(statValue(stats, ["Total Elevation Gain", "Gain on way in"]))},
        {label: "Summit", value: metric(statValue(stats, ["Elevation"]))},
        {label: "Route", value: sentenceCase(statValue(stats, ["Type"]))},
        {label: "Season", value: sentenceCase(statValue(stats, ["Seasons"]))},
    ].filter((fact) => fact.value);
}

function paragraphs(text) {
    return (text || "").split(/\n\s*\n|\r?\n/).map((p) => p.trim()).filter(Boolean);
}

function sourceName(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
        return null;
    }
}

function TrailMap({trail, geojson, large}) {
    const mapRef = useRef();
    const features = useMemo(
        () => geojson ? new GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(geojson) : [],
        [geojson]
    );
    const center = fromLonLat([trail.center_lng, trail.center_lat]);
    const marker = useMemo(() => [new Feature(new Point(center))], [trail.center_lat, trail.center_lng]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const map = mapRef.current && mapRef.current.ol;
        if (!map || features.length === 0) return;
        const extent = features[0].getGeometry().getExtent();
        map.getView().fit(extent, {padding: [32, 32, 32, 32], maxZoom: 15});
    }, [features]);

    return <div className={large ? "trail-map trail-map-large" : "trail-map"}>
        <RMap ref={mapRef} width="100%" height="100%" initial={{center, zoom: 12}}>
            <LayersControl/>
            {features.length > 0
                ? <RLayerVector zIndex={5} features={features}>
                    <TrailStyle width={4}/>
                </RLayerVector>
                : <RLayerVector zIndex={5} features={marker}>
                    <RStyle.RStyle>
                        <RStyle.RCircle radius={7}>
                            <RStyle.RFill color={TRAIL_COLOR}/>
                            <RStyle.RStroke color="#fff" width={2}/>
                        </RStyle.RCircle>
                    </RStyle.RStyle>
                </RLayerVector>}
        </RMap>
    </div>;
}

function AddToPlan({trailId}) {
    const {accessToken} = useContext(UserContext);
    const [open, setOpen] = useState(false);
    const [plans, setPlans] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        if (!open || !accessToken || plans !== null) return;
        setLoadFailed(false);
        getPlans(accessToken)
            .then((response) => setPlans(response.data || []))
            .catch(() => setLoadFailed(true));
    }, [open, accessToken, plans]);

    if (!accessToken) {
        return <p className="trail-signin">Sign in from the header to add this trail to a trip plan.</p>;
    }

    async function addToPlan() {
        setSaving(true);
        try {
            const response = await getPlan(accessToken, selectedPlan);
            const tripPlan = response.data;
            tripPlan.trails = tripPlan.trails || [];
            if (!tripPlan.trails.includes(trailId)) {
                tripPlan.trails.push(trailId);
                await updatePlan(accessToken, tripPlan, selectedPlan);
            }
            setOpen(false);
            toast.success(`Added to ${tripPlan.name}`);
        } catch (e) {
            toast.error("The trail wasn't added. Check your connection and try again.");
        } finally {
            setSaving(false);
        }
    }

    const options = (plans || []).map((plan) => ({key: plan.id, text: plan.name, value: plan.id}));

    return <Modal
        size="tiny"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        trigger={<button type="button" className="trail-add">Add to trip plan</button>}
    >
        <Modal.Header>Add to trip plan</Modal.Header>
        <Modal.Content>
            {loadFailed
                ? <p>Your trip plans couldn't be loaded. Sign in again from the header, then try adding the trail.</p>
                : plans !== null && plans.length === 0
                ? <p>You don't have any trip plans yet. <Link to="/plan/create">Create a plan</Link> first.</p>
                : <Dropdown
                    placeholder="Choose a plan"
                    fluid selection
                    loading={plans === null}
                    options={options}
                    onChange={(e, data) => setSelectedPlan(data.value)}
                />}
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button primary disabled={!selectedPlan || saving} loading={saving} onClick={addToPlan}>
                Add to plan
            </Button>
        </Modal.Actions>
    </Modal>;
}

export default function TrailDetails() {
    const {geohash} = useParams();
    const [state, setState] = useState({status: "loading"});

    useEffect(() => {
        setState({status: "loading"});
        Promise.all([getTrail(geohash), getTrailGeojson(geohash).catch(() => null)])
            .then(([trail, geojson]) => setState({status: "ready", trail, geojson}))
            .catch(() => setState({status: "missing"}));
    }, [geohash]);

    if (state.status === "loading") {
        return <div className="trail-page"><p className="trail-message">Loading trail…</p></div>;
    }
    if (state.status === "missing") {
        return <div className="trail-page">
            <p className="trail-message">
                This trail doesn't exist. <Link to="/trails">Browse trails on the map</Link> instead.
            </p>
        </div>;
    }

    const {trail, geojson} = state;
    const stats = trail.stats || {};
    const facts = trailFacts(stats);
    const place = [statValue(stats, ["Peak"]), statValue(stats, ["Town", "Location"])].filter(Boolean).join(", ");
    const rating = statValue(stats, ["Stars"]);
    const ascentDate = statValue(stats, ["Date"]);
    const ascentType = statValue(stats, ["Ascent Type"]);
    const description = paragraphs(trail.description);
    const directions = paragraphs(trail.directions);
    const hasPhotos = (trail.photos || []).length > 0;
    const source = sourceName(trail.source_url);

    return <article className="trail-page">
        {hasPhotos
            ? <PhotoStrip photos={trail.photos} title={trail.title}/>
            : <TrailMap trail={trail} geojson={geojson} large/>}

        <div className="trail-body">
            <header className="trail-header">
                <h1>{trail.title}</h1>
                {(place || rating) && <p className="trail-place">
                    {place && <span>{place}</span>}
                    {rating && <span>Rated {rating} of 5</span>}
                </p>}
                {facts.length > 0 && <dl className="trail-facts">
                    {facts.map((fact) => <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                    </div>)}
                </dl>}
            </header>

            <aside className="trail-aside">
                {hasPhotos && <TrailMap trail={trail} geojson={geojson}/>}
                <AddToPlan trailId={trail.center_geohash}/>
                {source && <p className="trail-source">
                    Details{hasPhotos ? " and photos" : ""} from <a href={trail.source_url} target="_blank" rel="noreferrer">{source}</a>
                </p>}
            </aside>

            <div className="trail-text">
                {description.length > 0 && <section>
                    <h2>About this route</h2>
                    {description.map((p, i) => <p key={i}>{p}</p>)}
                </section>}
                {directions.length > 0 && <section>
                    <h2>Getting there</h2>
                    {directions.map((p, i) => <p key={i}>{p}</p>)}
                </section>}
                {description.length === 0 && ascentDate && <section>
                    <p>
                        Recorded from an ascent on {ascentDate}{ascentType ? ` (${ascentType.toLowerCase()})` : ""}.
                        {source && <> See the <a href={trail.source_url} target="_blank" rel="noreferrer">full trip report</a> for route notes.</>}
                    </p>
                </section>}
            </div>
        </div>
    </article>;
}
