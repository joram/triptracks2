import React, {useEffect, useState} from "react";
import {getForecast} from "../../../utils/api";
import moment from "moment";
import {Container, Image, Segment, Table} from "semantic-ui-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export function Forecast({isMultiDay, date, dateRange, trails}) {
    let [forecast, setForecast] = useState(null)
    let [geohash, setGeohash] = useState(null)
    let [details, setDetails] = useState(null)


    useEffect(() => {
        const longestGeohash = trails.sort(
            function (a, b) {
                return b.length - a.length;
            }
        )[0];

        fetch(`/trail_details/${longestGeohash}.json`).then(results => results.json()).then(newDetails => {
            setDetails(newDetails)
            console.log("getting the forecast", newDetails)
            getForecast(newDetails.center_lat, newDetails.center_lng).then(response => {
                setForecast(dataToForecast(response.data))
            })
        })
    }, [trails]);

    function dataToForecast(data) {
        let overview = []

        let yrNo = data.weather.properties.timeseries
        console.log(`got ${yrNo.length} data points`)
        yrNo.forEach(datum => {
            let date = moment(datum.time)
            let next6hours = datum.data.next_6_hours
            let instant = datum.data.instant

            if((date.hours()-4) % 6 === 0) {
                let yLabels = {
                    4: "late night",
                    10: "morning",
                    16: "afternoon",
                    24: "evening",
                }
                let precip = instant.details.precipitation_amount
                let symbol = instant.summary.symbol_code
                if (next6hours !== undefined) {
                    precip = next6hours.details.precipitation_amount
                    symbol = next6hours.summary.symbol_code
                }

                overview.push({
                    yLabel:date.format("dd DD HH a"),
                    air_temperature: instant.details.air_temperature,
                    precipitation_amount: precip,
                    symbol_code: symbol,
                })
            }

        })

        let results =  {
            overviewForecasts: overview,
            forecastUnits: data.weather.properties.meta.units,
            forecastLocation: data.weather.geometry,
        }
        console.log(results)
        return results;
    }

    if (forecast === null) {
        return <Container>
            <Segment basic>
                <h1>Loading...</h1>
            </Segment>
        </Container>
    }

    function dayGraphs() {
        let precipCells = forecast.overviewForecasts.map((datum, index) => {
            return <Table.Cell key={"precip_"+index}>{datum.precipitation_amount + forecast.forecastUnits.precipitation_amount}</Table.Cell>
        })
        let units = "??"
        if(forecast.forecastUnits.air_temperature === "celsius") {
            units = "°C"
        }
        let tempCells = forecast.overviewForecasts.map((datum, index) => {
            return <Table.Cell key={"temp_"+index}>{datum.air_temperature + " " + units}</Table.Cell>
        })
        let labelCells = forecast.overviewForecasts.map((datum, index) => {
            return <Table.Cell key={"label_"+index}>{datum.yLabel}</Table.Cell>
        });

        let iconCells = forecast.overviewForecasts.map((datum, index) => {
            let code = datum.symbol_code
            let svgPath = "/weather_icons/"+code+".svg"
            return <Table.Cell key={"icon_"+index}><Image src={svgPath} size={"mini"}/></Table.Cell>
        })

        return <Container scrolling>
        <Table style={{ overflow: 'auto', display: 'inline-block'}}>
            <Table.Body>
                <Table.Row>{labelCells}</Table.Row>
                <Table.Row>{iconCells}</Table.Row>
                <Table.Row>{precipCells}</Table.Row>
                <Table.Row>{tempCells}</Table.Row>
            </Table.Body>
        </Table>
        </Container>
    }

    return <>
        <h1>Forecast for (
            lat:{forecast.forecastLocation.coordinates[0]},
            lng:{forecast.forecastLocation.coordinates[1]},
            alt:{forecast.forecastLocation.coordinates[2]}
            )</h1>
        {dayGraphs()}
        {/*{forecast.map((daysForecast, index) => { return <Segment key={index}>*/}
        {/*    <h2>{moment(daysForecast.dates[0]).format("dddd, MMMM Do")}</h2>*/}
        {/*    {dayGraphs(daysForecast)}*/}
        {/*</Segment>}*/}
        {/*)}*/}
    </>
}