import React, {useEffect, useState} from "react";
import {getForecast} from "../../../utils/api";
import moment from "moment";
import {Container, Segment, Table} from "semantic-ui-react";
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

        console.log(data.weather.forecast.forecastday[0])
        data.weather.forecast.forecastday.forEach(day => {
            let date = moment(day.date).format("YYYY-MM-DD")
            overview.push({
                date: date,
                probability: day.day.daily_chance_of_rain,
                precipitation: day.day.totalprecip_mm,
            })
        })

        console.log({
            overviewForecasts: overview,
        })
        return {
            overviewForecasts: overview,
        }
    }

    if (forecast === null) {
        return <Container>
            <Segment basic>
                <h1>Loading...</h1>
            </Segment>
        </Container>
    }

    function dayGraphs(daysForecast) {

        let precipCells = daysForecast.precipMm.map((precip, index) => {
            return <Table.Cell key={"precip_"+index}>{precip}</Table.Cell>
        })
        let popCells = daysForecast.pop.map((pop, index) => {
            return <Table.Cell key={"pop_"+index}>{pop}</Table.Cell>
        })
        // let dateCells = daysForecast.dates.map((date, index) => {
        //     return <Table.Cell key={"date_"+index}>{date}</Table.Cell>
        // })
        return <Table>
            <Table.Body>
                <Table.Row>{precipCells}</Table.Row>
                <Table.Row>{popCells}</Table.Row>
                {/*<Table.Row>{dateCells}</Table.Row>*/}
            </Table.Body>
        </Table>
    }

    function overviewGraphs() {
        return <>
            <Segment>
                <h2>Overview</h2>
                <LineChart
                    width={1000}
                    height={300}
                    data={forecast.overviewForecasts}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="precipitation" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="probability" stroke="#82ca9d" />

                </LineChart>
            </Segment>
        </>
    }
    return <>
        {overviewGraphs()}
        {/*{forecast.map((daysForecast, index) => { return <Segment key={index}>*/}
        {/*    <h2>{moment(daysForecast.dates[0]).format("dddd, MMMM Do")}</h2>*/}
        {/*    {dayGraphs(daysForecast)}*/}
        {/*</Segment>}*/}
        {/*)}*/}
    </>
}