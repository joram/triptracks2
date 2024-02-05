import React, {Component, useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {Carousel} from "react-responsive-carousel";
import {Button, Dropdown, Header, Modal, Tab} from "semantic-ui-react";
import {getPlan, getPlans, updatePlan} from "../../utils/api";
import {UserContext} from "../../App";

class TrailImageCarousel extends Component {
    render() {
        let images = []
        this.props.trail.photos.forEach(image => {
            images.push(<div key={image}>
                <img src={image} alt={"trail"}/>
            </div>)
        })
        return <Carousel dynamicHeight={true}>{images}</Carousel>
    }
}

class TrailMap extends Component {
    render() {
        return <>TODO</>
    }
}

export default function TrailDetails() {
    let [loading, setLoading] = useState(true)
    let [data, setData] = useState(null)
    let [showPlanModal, setShowPlanModal] = useState(false)
    let [, setPlans] = useState([])
    let [planNames, setPlanNames] = useState([])
    let [selectedPlan, setSelectedPlan] = useState(null)
    const { accessToken } = useContext(UserContext);
    let { geohash } = useParams();

    useEffect(() => {
        fetch(`/trail_details/${geohash}.json`).then(results => results.json()).then(json => {
            setData(json)
            setLoading(false)
        })
        getPlans(accessToken).then(response => {
            setPlans(response.data)
            let newPlanNames = []
            response.data.map(plan =>
                newPlanNames.push({key: plan.id, text: plan.name, value: plan.id})
            )
            setPlanNames(newPlanNames)
        })

    }, [accessToken, geohash])

    if(loading){
        return <div>Loading...</div>
    }

    const panes = [
      { menuItem: 'Photos', render: () => <Tab.Pane><TrailImageCarousel trail={data} /></Tab.Pane> },
      { menuItem: 'Description', render: () => <Tab.Pane>{data.description}</Tab.Pane> },
      { menuItem: 'Directions', render: () => <Tab.Pane>{data.directions}</Tab.Pane> },
      { menuItem: 'Map', render: () => <Tab.Pane><TrailMap trail={data} /></Tab.Pane> },
    ]

    return <>
        <Header>{data["title"]}</Header>
        <Modal
            onClose={() => setShowPlanModal(false)}
            onOpen={() => setShowPlanModal(true)}
            open={showPlanModal}
            trigger={<Button>Add Tp Trip Plan</Button>}
        >
            <Modal.Header>Add Trail to Trip Plan</Modal.Header>
            <Modal.Content>
                <Modal.Description>
                    <Header>Select Plan</Header>
                    <Dropdown placeholder='Select Plan' fluid selection options={planNames} onChange={
                        (e, data) => {
                            setSelectedPlan(data.value)
                        }
                    }/>
                </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => setShowPlanModal(false)}>
                    Cancel
                </Button>
                <Button
                    content="Add"
                    labelPosition='right'
                    icon='checkmark'
                    onClick={() => {
                        setShowPlanModal(false)
                        getPlan(accessToken, selectedPlan).then(async response => {
                            let tripPlan = response.data
                            if(tripPlan.trails === undefined){
                                tripPlan.trails = []
                            }
                            if(!tripPlan.trails.includes(data.center_geohash)){
                                tripPlan.trails.push(data.center_geohash)
                                await updatePlan(accessToken, tripPlan, selectedPlan)
                            }
                            setLoading(false)
                        })
                    }}
                    positive
                />
            </Modal.Actions>
        </Modal>
        <Tab panes={panes} />

    </>
}
