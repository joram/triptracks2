import React, {Component} from "react";
import Polyline from "react-google-maps/lib/components/Polyline";

class Trail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            polylines: [],
            trail: {
                waypoints: [],
                title: "",
            },
            peak: {
                geohash: "",
                lat: "",
                lng: "",
                title: "",
            },
            isLoaded: false,
        };
    }

    hide(){
        this.state.polylines.forEach(polyline => {
            polyline.setMap(null)
        })
    }
    buildPolylines(trail){
        let lines = [];
        let i = 0;
        if(trail.waypoints !== undefined){
            trail.waypoints.forEach(segment => {
                lines.push(<Polyline
                    path={segment}
                    geodesic={true}
                    options={{
                        strokeColor: "#ff2527",
                        strokeOpacity: 0.75,
                        strokeWeight: 2,
                    }}
                    key={`${this.state.title}_${i}`}
                    onClick={this.onClick.bind(this)}
                />)
                i += 1
            })
        }
        return lines
    }
    componentDidMount() {
        fetch(this.props.filepath).then(res => res.json()).then((trail) => {
            let state = this.state;
            state.trail = trail
            state.polylines = this.buildPolylines(trail)
            this.setState(state);
            fetch(`/peaks/${trail.nearest_peak_geohash}.json`).then(res => res.json()).then((peak) => {
                let state = this.state;
                state.peak = peak
                this.setState(state);
            })
        })
    }

    onClick(){

    }

    render() {
        return <>{this.state.polylines}</>
    }
}


export default Trail;