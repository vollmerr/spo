import React, { Component } from 'react';

import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';

import * as sp from '../api/sp';
import lists from '../api/lists';

import List from '../components/List';
import ListButtons from '../components/ListButtons';
import Acknowledgment from '../components/Acknowledgment';

class ListContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentItem: 0,
      filteredItems: this.props.items,
      filteredValue: '',
      items: this.props.items,
      acknowledgeHidden: true,
      columns: [
        {
          ariaLabel: "Column operations for file type.   ",
          className: "od-DetailsRow-cell--FileIcon",
          columnActionsMode: 1,
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
          key: lists.ack.title.key,
          fieldName: lists.ack.title.key,
          name: lists.ack.title.name,
          ariaLabel: lists.ack.title.ariaLabel,
          columnActionsMode: 2,
          maxWidth: 400,
          minWidth: 200,
          isSorted: false,
          isSortedDescending: false,
          isResizable: true,
          isPadded: true,
          data: {
            type: 'string',
          },
        },
        {
          key: lists.ack.dateRead.key,
          fieldName: lists.ack.dateRead.key,
          name: lists.ack.dateRead.name,
          ariaLabel: lists.ack.dateRead.ariaLabel,
          columnActionsMode: 2,
          maxWidth: 200,
          minWidth: 100,
          isSorted: true,
          isSortedDescending: true,
          isResizable: true,
          isPadded: true,
          data: {
            type: 'date',
          },
          onRender: item => item[lists.ack.dateRead.key].slice(0, 10),
        },
        {
          key: lists.ack.dateAck.key,
          fieldName: lists.ack.dateAck.key,
          name: lists.ack.dateAck.name,
          ariaLabel: lists.ack.dateAck.ariaLabel,
          columnActionsMode: 2,
          maxWidth: 200,
          minWidth: 100,
          isSorted: true,
          isSortedDescending: true,
          isResizable: true,
          isPadded: true,
          data: {
            type: 'date',
          },
          onRender: item => item[lists.ack.dateAck.key].slice(0, 10),
        },
        {
          key: 'buttons',
          name: '',
          maxWidth: 250,
          minWidth: 200,
          columnActionsMode: 1,
          isPadded: true,
          onRender: item => (
            <ListButtons
              key={item.id}
              item={item}
              onClickRead={() => this.handleClickRead(item)} // TODO!
              onClickAck={() => this.handleToggleAck(item)} // TODO!
            />
          ),
        },
      ],
    };
  }

  updateItems = () => this.setState({ items: this.props.items })

  /**
   * Handles toggling the acknowledgment modal
   * @param {object} item   - item user is acknowledging
   */
  handleToggleAck = (item) => (
    this.setState({
      acknowledgeHidden: !this.state.acknowledgeHidden,
      currentItem: item ? item.Id : null,
    })
  )

  /**
   * Handles clicking the 'Acknowledge' button
   * from withing the acknowledgment modal
   */
  handleClickAck = () => {
    const data = {
      [lists.ack.dateAck.key]: new Date().toISOString(),
      [lists.ack.hasAck.key]: true,
    };

    this.props.handleUpdateItem(data, this.state.currentItem)
      .then(this.updateItems)
      .then(this.handleToggleAck);
  }

  /**
   * Handles clicking the 'Read' button
   * @param {object} item   - item user is reading
   */
  handleClickRead = (item) => {
    if (!item[lists.ack.hasRead.key]) {
      const data = {
        [lists.ack.dateRead.key]: new Date().toISOString(),
        [lists.ack.hasRead.key]: true,
      };
      this.props.handleUpdateItem(data, item.Id)
        .then(this.updateItems);
    }
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
      lists.ack.dateAck.key,
      lists.ack.dateRead.key,
      lists.ack.title.key,
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
      lists.ack.dateAck,
      lists.ack.dateRead,
      lists.ack.title,
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
      <div className="ms-Grid" style={{ margin: '15px 0 60px 0' }}>
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm6">
            <h2>{this.props.title}</h2>
          </div>
          <div className="ms-Grid-col ms-u-sm6">
            <SearchBox onChange={this.handleSearch} />
          </div>
        </div>

        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-u-sm12">
            {
              this.state.filteredItems.length ?
                <List
                  items={this.state.filteredItems}
                  columns={this.state.columns}
                  onColumnHeaderClick={this.handleClickColumn}
                />
                :
                <p>No Items Available</p>
            }
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

export default ListContainer;
