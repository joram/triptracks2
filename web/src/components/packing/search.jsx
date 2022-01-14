import React, {Component} from "react";
import {CardGroup, Input} from "semantic-ui-react";
import _ from "lodash";
import {DraggableItem} from "./draggableItem";


class ItemSearch extends Component {
    state = {
        data: [],
        results: [],
        loading: true
    };

    componentDidMount(){
        fetch(this.props.data_url).then(r => r.json()).then(data => {
            let state = this.state
            state.data=data
            state.loading = false
            this.setState(state)
        })
    }

    onChange(e, data){
        if(this.state.loading){ return }
        let searchText = data.value
        const re = new RegExp(_.escapeRegExp(searchText), 'i')
        const isMatch = (result) => re.test(result.name)
        let results = _.filter(this.state.data, isMatch)
        let state = this.state
        state.results = results.slice(0,5)
        this.setState(state)
    }

    render() {
        let itemCards = [];
        this.state.results.forEach(item => {
            itemCards.push(<DraggableItem
                deletable={false}
                key={item.name}
                name={item.name}
                weight={item.weight}
                image_url={item.image}
            />)
        })
        return <>
            <br/>
            <Input placeholder='Search...' onChange={this.onChange.bind(this)}/>
            <br/>
            <br/>
            <CardGroup>{itemCards}</CardGroup>
        </>
    }
}

export default ItemSearch;