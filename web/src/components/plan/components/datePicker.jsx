import {Button, ButtonGroup} from "semantic-ui-react";
import SemanticDatepicker from "react-semantic-ui-datepickers";
import React from "react";

export function DatePicker({isMultiDay, setIsMultiDay, date, setDate, dateRange, setDateRange}) {
    console.log(date, dateRange)
    if(dateRange !== null && dateRange.length === 2){
        dateRange = dateRange.map(d => Date.parse(d))
    }

    return <>
        <ButtonGroup basic style={{marginRight: "10px"}}>
            <Button
                active={!isMultiDay}
                onClick={() => {
                    setIsMultiDay(false)
                    setDate(null)
                }}
            >
                single day
            </Button>
            <Button active={isMultiDay} onClick={() => {
                setIsMultiDay(true)
                setDateRange([])
            }}>multi-day</Button>
        </ButtonGroup>
        <SemanticDatepicker
            key={"date_picker_" + isMultiDay}
            type={isMultiDay ? "range" : "basic"}
            style={{width: "225px"}}
            showToday={true}
            value={isMultiDay ? dateRange : date}
            onChange={(event, data) => {
                if (data.type === "range") {
                    setDateRange(data.value)
                } else if (data.type === "basic") {
                    setDate(data.value)
                }
            }}
        />
    </>
}