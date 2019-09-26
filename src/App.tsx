import React from 'react';
import styled from 'styled-components'
import { Column } from 'react-table'
import Table from './Table'
import { makeData, Person } from './utils'
import { roundedMedian } from './aggregators';
import { filterGreaterThan, SliderColumnFilter, SelectColumnFilter, NumberRangeColumnFilter } from './Filters';

const Styles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
    td {
      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }
  .pagination {
    padding: 0.5rem;
  }
`

function App() {
  const [data, setData] = React.useState(() => makeData(10000))
  const [originalData] = React.useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  const skipPageResetRef = React.useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnID and new value to update the
  // original data
  const updateMyData = (rowIndex: number, columnID: string, value: unknown) => {
    // We also turn on the flag to not reset the page
    skipPageResetRef.current = true
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnID]: value,
          }
        }
        return row
      })
    )
  }

  // After data chagnes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  React.useEffect(() => {
    skipPageResetRef.current = false
  }, [data])

  // Let's add a data resetter/randomizer to help
  // illustrate that flow...
  const resetData = () => {
    // Don't reset the page when we do this
    skipPageResetRef.current = true
    setData(originalData)
  }

  const columns = React.useMemo<Column<Person>[]>(
    () => [
      {
        id: 'selection',
        // Make this column a groupByBoundary. This ensures that groupBy columns
        // are placed after it
        groupByBoundary: true,
        // The header can use the table's getToggleAllRowsSelectedProps method
        // to render a checkbox
        Header: ({ getToggleAllRowsSelectedProps }) => (
          <div>
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          </div>
        ),
        // The cell can use the individual row's getToggleRowSelectedProps method
        // to the render a checkbox
        Cell: ({ row }) => (
          <div>
            <input type="checkbox" {...row.getToggleRowSelectedProps()} />
          </div>
        ),
      },
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
            // Use a two-stage aggregator here to first
            // count the total rows being aggregated,
            // then sum any of those counts if they are
            // aggregated further
            aggregate: ['sum', 'count'],
            Aggregated: ({ cell: { value } }) => `${value} Names`,
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
            // Use our custom `fuzzyText` filter on this column
            filter: 'fuzzyText',
            // Use another two-stage aggregator here to
            // first count the UNIQUE values from the rows
            // being aggregated, then sum those counts if
            // they are aggregated further
            aggregate: ['sum', 'uniqueCount'],
            Aggregated: ({ cell: { value } }) => `${value} Unique Names`,
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
            Filter: SliderColumnFilter,
            filter: 'equals',
            // Aggregate the average age of visitors
            aggregate: 'average',
            Aggregated: ({ cell: { value } }) => `${value} (avg)`,
          },
          {
            Header: 'Visits',
            accessor: 'visits',
            Filter: NumberRangeColumnFilter,
            filter: 'between',
            // Aggregate the sum of all visits
            aggregate: 'sum',
            Aggregated: ({ cell: { value } }) => `${value} (total)`,
          },
          {
            Header: 'Status',
            accessor: 'status',
            Filter: SelectColumnFilter,
            filter: 'includes',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
            Filter: SliderColumnFilter,
            filter: filterGreaterThan,
            // Use our custom roundedMedian aggregator
            aggregate: roundedMedian,
            Aggregated: ({ cell: { value } }) => `${value} (med)`,
          },
        ],
      },
    ],
    []
  )

  return (
    <Styles>
      <button onClick={resetData}>Reset Data</button>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        disablePageResetOnDataChange={skipPageResetRef.current}
      />
    </Styles>
  )
}

export default App;
