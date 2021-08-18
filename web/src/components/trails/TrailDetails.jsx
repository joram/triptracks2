import React, {Component, useState} from "react";
import {useParams} from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {Carousel} from "react-responsive-carousel";
import {Tab} from "semantic-ui-react";

class TrailImageCarousel extends Component {
    render() {
        let images = []
        console.log(this.props.trail)
        this.props.trail.photos.forEach(image => {
            images.push(<div key={image}>
                <img src={image} />
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
    let [data, setData] = useState(null)
    let { geohash } = useParams();

    if(data===null){
        fetch(`/trail_details/${geohash}.json`).then(results => results.json()).then(json => {
            setData(json)
        })
        return null
    }

    const panes = [
      { menuItem: 'Photos', render: () => <Tab.Pane><TrailImageCarousel trail={data} /></Tab.Pane> },
      { menuItem: 'Description', render: () => <Tab.Pane>{data.description}</Tab.Pane> },
      { menuItem: 'Directions', render: () => <Tab.Pane>{data.directions}</Tab.Pane> },
      { menuItem: 'Map', render: () => <Tab.Pane><TrailMap trail={data} /></Tab.Pane> },
    ]
    console.log(data)
    return <>
        {data["title"]}
        <Tab panes={panes} />
    </>
}
