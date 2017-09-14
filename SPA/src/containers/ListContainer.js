import React, { Component } from 'react';

import * as sp from '../api/sp';
import lists from '../api/lists';

import Search from '../components/Search';
import List from '../components/List';
import ListButtons from '../components/ListButtons';

class ListContainer extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: 0,
      filteredItems: [],
      filteredValue: '',
      items: [],
      docs: [],
      columns: [],
      acknowledgeHidden: true,
    };
  }

  /**
   * TODO: MOVE OUTSIDE (how handle bind this in funcs)
   * Handles setting up the column objects
   */
  setColumns = () => {
    const columns = [
      {
        ariaLabel: "Column operations for file type.   ",
        className: "od-DetailsRow-cell--FileIcon",
        columnActionsMode: 2,
        fieldName: "type",
        headerClassName: "od-DetailsHeader-cell--FileIcon",
        iconClassName: "ms-Icon--Page od-DetailsListHeader-FileTypeIcon",
        isIconOnly: true,
        key: "type",
        maxWidth: 16,
        minWidth: 16,
        name: "Type",
        onColumnClick: () => alert('handling col click for type'),
      },
      {
        key: lists.docs.title.key,
        fieldName: lists.docs.title.key,
        name: lists.docs.title.name,
        ariaLabel: lists.docs.title.ariaLabel,
        columnActionsMode: 2,
        maxWidth: 400,
        minWidth: 200,
        isSorted: false,
        isSortedDescending: false,
        isResizable: true,
        data: {
          type: 'string',
        },
      },
      {
        key: lists.docs.dateRead.key,
        fieldName: lists.docs.dateRead.key,
        name: lists.docs.dateRead.name,
        ariaLabel: lists.docs.dateRead.ariaLabel,
        columnActionsMode: 2,
        maxWidth: 200,
        minWidth: 100,
        isSorted: true,
        isSortedDescending: true,
        isResizable: true,
        data: {
          type: 'date',
        },
        onRender: item => item[lists.docs.dateRead.key].slice(0, 10)
      },
      {
        key: lists.docs.dateAck.key,
        fieldName: lists.docs.dateAck.key,
        name: lists.docs.dateAck.name,
        ariaLabel: lists.docs.dateAck.ariaLabel,
        columnActionsMode: 2,
        maxWidth: 200,
        minWidth: 100,
        isSorted: true,
        isSortedDescending: true,
        isResizable: true,
        data: {
          type: 'date',
        },
        onRender: item => item[lists.docs.dateAck.key].slice(0, 10)
      },
      {
        key: 'buttons',
        name: '',
        maxWidth: 250,
        minWidth: 200,
        onRender: item => (
          <ListButtons
            key={item.id}
            item={item}
            onClickRead={() => this.handleClickRead(item)}
            onClickAck={() => this.handleToggleAck(item)}
          />
        ),
      },
    ];

    this.setState({ columns });
  }

  /**
   * Handles clicking on a column header
   * Sorts current column, then in order of sortOrder if same value
   * @param {event} event     - onClick event
   * @param {object} column   - column clicked on
   */
  handleClickColumn = (event, column) => {
    const { columns, items, filteredItems } = this.state;
    const newColumns = columns.slice();
    const curColumn = newColumns.filter(col => col.key === column.key)[0];
    let newItems = items.slice();
    let newFilteredItems = filteredItems.slice();
    let sortOrder = [
      lists.docs.dateAck.key,
      lists.docs.dateRead.key,
      lists.docs.title.key,
    ];

    newColumns.forEach(col => {
      if (col === curColumn) {
        curColumn.isSortedDescending = !curColumn.isSortedDescending;
        curColumn.isSorted = true;
      } else {
        col.isSorted = false;
      }
    });

    const getValue = (value, data) =>
      data && data.type === 'date' ?
        isNaN(Date.parse(value)) ?
          Date.parse('9999/1/1') :
          Date.parse(value) :
        value;

    const sorted = (a, b, desc) => {
      if (a < b) return desc ? 1 : -1;
      if (a > b) return desc ? -1 : 1;
      return 0;
    }

    sortOrder.slice(sortOrder.indexOf(column.key));
    sortOrder.unshift(column.key);

    newItems = newItems.sort((a, b) => {
      let curretSort = 0;
      let finalSort = curretSort;

      sortOrder.forEach(key => {
        const col = newColumns.find(col => col.key === key);
        const value1 = getValue(a[key], col.data);
        const value2 = getValue(b[key], col.data);
        const curretSort = sorted(value1, value2, col.isSortedDescending);

        if (!finalSort) {
          finalSort = curretSort;
        }
      });

      return finalSort;
    });

    this.setState({
      columns: newColumns,
      items: newItems,
      filteredItems: newItems.filter(item => filteredItems.includes(item)),
    });
  }


  /**
   * Handles typing in the search bar
   * Filters the items displayed based off value
   * @param {string} userValue    - value user entered
   */
  handleSearch = (userValue) => {
    const filterableFields = [
      lists.docs.dateAck,
      lists.docs.dateRead,
      lists.docs.title,
    ];

    const filteredItems = this.state.items.filter(item => (
      filterableFields.some(field => (
        String(item[field.key])
          .toLowerCase()
          .match(userValue.toLowerCase())
      ))
    ));

    this.setState({ filteredItems, filteredValue: userValue });
  }

  render() {
    return (
      <div className="ms-Grid">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm6">
            <h2>{this.props.title}</h2>
          </div>

          <div className="ms-Grid-col ms-u-sm6">
            <Search onChange={this.handleSearch} />
          </div>
        </div>

        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12">
            <List
              items={this.state.filteredItems}
              columns={this.state.columns}
              onColumnHeaderClick={this.handleClickColumn}
            />
          </div>
        </div>

        <Acknowledgment
          hidden={this.state.acknowledgeHidden}
          onDismiss={this.handleToggleAck}
          onConfirm={this.handleClickAck}
        />
      </div>
    );
  }
}

export default App;
