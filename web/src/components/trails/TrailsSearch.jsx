import React from 'react'
import {Search} from 'semantic-ui-react'
import {withRouter} from "react-router-dom";
import {searchTrails} from "../../utils/api";

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

    const query = data.value.trim()
    if (query.length < 2) {
      dispatch({ type: 'FINISH_SEARCH', results: [] })
      return
    }

    timeoutRef.current = setTimeout(() => {
      searchTrails(query)
        .then((results) => dispatch({ type: 'FINISH_SEARCH', results }))
        .catch(() => dispatch({ type: 'FINISH_SEARCH', results: [] }))
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
