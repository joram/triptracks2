import _ from 'lodash'
import React from 'react'
import {Search} from 'semantic-ui-react'
import {withRouter} from "react-router-dom";

let source = []
fetch("/trails.search.json").then(r => r.json()).then(data => {
  source = data
  console.log(source)
})

const initialState = {
  loading: false,
  results: [],
  value: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'CLEAN_QUERY':
      return initialState
    case 'START_SEARCH':
      return { ...state, loading: true, value: action.query }
    case 'FINISH_SEARCH':
      return { ...state, loading: false, results: action.results }
    case 'UPDATE_SELECTION':
      return { ...state, value: action.selection }

    default:
      throw new Error()
  }
}

function TrailSearch(props) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const { loading, results, value } = state
  const timeoutRef = React.useRef()

  const handleSearchChange = React.useCallback((e, data) => {
    clearTimeout(timeoutRef.current)
    dispatch({ type: 'START_SEARCH', query: data.value })

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        return []
      }

      const re = new RegExp(_.escapeRegExp(data.value), 'i')
      const isMatch = (result) => re.test(result.title)

      dispatch({
        type: 'FINISH_SEARCH',
        results: _.filter(source, isMatch),
      })
    }, 300)
  }, [])

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <Search
      loading={loading}
      onResultSelect={(e, data) =>{
        dispatch({type: 'UPDATE_SELECTION', selection: data.result.title})
        props.history.push(data.result.url)
      }}
      onSearchChange={handleSearchChange}
      results={results}
      value={value}
    />
  )
}

export default withRouter(TrailSearch)
