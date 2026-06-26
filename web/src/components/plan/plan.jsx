import React, {useContext, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {Button, Container, Input, Segment, Step} from "semantic-ui-react";
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css";
import {UserContext} from "../../App.jsx";
import {getPlan, updatePlan} from "../../utils/api";
import fleshOutItinerary from "./components/utils/itinerary";
import RoutesStep from "./components/steps/RoutesStep";
import PinsStep from "./components/steps/PinsStep";
import ItineraryStep from "./components/steps/ItineraryStep";
import PackingStep from "./components/steps/PackingStep";
import ReadOnlyTripPlan from "./readOnlyPlan";

const STEPS = [
    {key: "routes", title: "Routes", icon: "map"},
    {key: "pins", title: "Pins", icon: "map marker alternate"},
    {key: "itinerary", title: "Itinerary", icon: "calendar"},
    {key: "packing", title: "Packing", icon: "suitcase"},
];

function TripPlan() {
    const {accessToken} = useContext(UserContext);
    const {id} = useParams();

    const [loading, setLoading] = useState(true);
    const [editable, setEditable] = useState(false);
    const [plan, setPlan] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [date, setDate] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [people, setPeople] = useState([]);
    const [trails, setTrails] = useState([]);
    const [pins, setPins] = useState([]);
    const [packing, setPacking] = useState([]);
    const [itinerary, setItinerary] = useState([]);

    const itineraryRef = useRef(itinerary);
    itineraryRef.current = itinerary;

    // ---- load ----
    useEffect(() => {
        getPlan(accessToken, id).then((response) => {
            const tp = response.data;
            setPlan(tp);
            setEditable(!!tp.editable);
            setName(tp.name || "");
            setPeople(tp.people || []);
            setTrails(tp.trails || []);
            setPins(tp.pins || []);
            setPacking(Array.isArray(tp.packing_lists) ? tp.packing_lists : []);
            setItinerary((tp.itinerary || []).map((d) => ({...d, date: new Date(d.date)})));

            const dates = tp.dates || {type: "basic", dates: null};
            if (dates.type === "range") {
                setIsMultiDay(true);
                setDateRange((dates.dates || []).map((d) => (d ? new Date(d) : d)));
            } else {
                setIsMultiDay(false);
                setDate(dates.dates ? new Date(dates.dates) : null);
            }
            setLoading(false);
        });
    }, [accessToken, id]);

    // ---- keep itinerary days in sync with the selected dates ----
    useEffect(() => {
        if (loading) {
            return;
        }
        if (!isMultiDay && !date) {
            setItinerary([]);
            return;
        }
        const next = fleshOutItinerary(date, dateRange, isMultiDay, itineraryRef.current);
        setItinerary(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, dateRange, isMultiDay, loading]);

    // ---- debounced autosave ----
    useEffect(() => {
        if (loading || !editable) {
            return;
        }
        const handle = setTimeout(() => {
            setSaving(true);
            const payload = {
                name,
                dates: {
                    type: isMultiDay ? "range" : "basic",
                    dates: isMultiDay ? dateRange : date,
                },
                people,
                trails,
                pins,
                packing_lists: packing,
                itinerary,
            };
            updatePlan(accessToken, payload, id).then(() => setSaving(false));
        }, 800);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, isMultiDay, date, dateRange, people, trails, pins, packing, itinerary, editable, loading]);

    if (loading) {
        return <Container>
            <Segment basic>
                <h1>Loading...</h1>
            </Segment>
        </Container>;
    }

    if (!editable) {
        return <ReadOnlyTripPlan trip_plan={plan}/>;
    }

    function renderStep() {
        switch (STEPS[activeStep].key) {
            case "routes":
                return <RoutesStep trails={trails} setTrails={setTrails} pins={pins}/>;
            case "pins":
                return <PinsStep pins={pins} setPins={setPins}/>;
            case "itinerary":
                return <ItineraryStep
                    isMultiDay={isMultiDay} setIsMultiDay={setIsMultiDay}
                    date={date} setDate={setDate}
                    dateRange={dateRange} setDateRange={setDateRange}
                    itinerary={itinerary} setItinerary={setItinerary}
                    trails={trails}
                />;
            case "packing":
                return <PackingStep packing={packing} setPacking={setPacking}/>;
            default:
                return null;
        }
    }

    return <Container>
        <Segment basic clearing>
            <Input
                size="huge"
                type="text"
                value={name}
                fluid
                onChange={(e) => setName(e.target.value)}
            />
            <div style={{textAlign: "right", color: "#999", fontSize: "0.85em", marginTop: "4px"}}>
                {saving ? "Saving..." : "All changes saved"}
            </div>
        </Segment>

        <Step.Group ordered widths={STEPS.length} fluid>
            {STEPS.map((step, index) => (
                <Step
                    key={step.key}
                    link
                    active={activeStep === index}
                    completed={activeStep > index}
                    onClick={() => setActiveStep(index)}
                >
                    <Step.Content>
                        <Step.Title>{step.title}</Step.Title>
                    </Step.Content>
                </Step>
            ))}
        </Step.Group>

        <Segment basic>
            {renderStep()}
        </Segment>

        <Segment basic clearing>
            <Button
                disabled={activeStep === 0}
                floated="left"
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            >
                Back
            </Button>
            <Button
                primary
                disabled={activeStep === STEPS.length - 1}
                floated="right"
                onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
                Next
            </Button>
        </Segment>
    </Container>;
}

export default TripPlan;
