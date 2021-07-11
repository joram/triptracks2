import React, {Component} from "react";
import Polyline from "react-google-maps/lib/components/Polyline";

class Trail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            waypoints: [],
            isLoaded: false,
            title: "",
        };
    }

    componentDidMount() {

        fetch(this.props.filepath).then(res => res.json()).then((result) => {
            this.setState(result);
        })
    }

    render() {
        let line = null;
        if(this.state.waypoints !== undefined){
            line = <Polyline
                path={this.state.waypoints}
                geodesic={true}
                options={{
                    strokeColor: "#ff2527",
                    strokeOpacity: 0.75,
                    strokeWeight: 2,
                }}
            />
        }
        return <div>
            {line}
        </div>
    }
}


export default Trail;