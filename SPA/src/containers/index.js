import React, { Component } from 'react';

import * as sp from '../api/sp';
import lists from '../api/lists';

import Search from '../components/Search';
import List from '../components/List';
import ListButtons from '../components/ListButtons';
import Acknowledgment from '../components/Acknowledgment';

class App extends Component {
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
    // FOR TESTING (pnp available in console)
    sp.globalPnp();
  }

  componentDidMount() {
    this.loadAckList()
      .then(this.loadDocs)
      .then(this.setColumns)
      .then(this.mapDocLinks);
  }

  /**
   * Loads a sharepiont list of the current users
   * acknowledgments and readings requried
   * These are the items displayed in the list
   */
  loadAckList = () => (
    sp.getUser()
      .then(user => (
        sp.listItems(
          lists.ack.listTitle,
          sp.admin,
        )
          .filter(`UserIdentity eq '${user.Title}'`)
          .orderBy(lists.docs.dateRead.key)
          .orderBy(lists.docs.dateAck.key)
          .get()
      ))
      .then(items => this.setState({ items, filteredItems: items }))
      .catch(err => console.error(err))
  )

  /**
   * Loads a sharepoint list of documents
   * These are all documents needing approval
   */
  loadDocs = () => (
    sp.listItems(lists.docs.listTitle, sp.admin)
      .get()
      .then(docs => this.setState({ docs }))
      .catch(err => console.error(err))
  )

  /**
   * Maps the document links to an href attribute on items
   */
  mapDocLinks = () => {
    const items = this.state.items.map(item => ({
      ...item,
      href: this.state.docs.find(x => x.Id === item[lists.docs.docId.key]).ServerRedirectedEmbedUrl,
    }));
    this.setState({ items, filteredItems: items });
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
   * Handles upading a sharepoint item with data
   * @param {object} data   - data to update in item
   * @param {number} id     - id of item to update
   * @return {promise}
   */
  handleUpdateItem = (data, id) => (
    sp.listItems(lists.ack.listTitle, sp.admin)
      .getById(id)
      .update(data)
      .then(() => {
        const items = [...this.state.items];
        const index = items.findIndex(x => x.Id === id);
        items[index] = {
          ...items[index],
          ...data,
        };

        this.setState({ items, filteredItems: items });
      })
      .catch(err => console.error(err))
  )

  /**
   * Handles clicking the 'Read' button
   * @param {object} item   - item user is reading
   */
  handleClickRead = (item) => {
    if (!item[lists.docs.hasRead.key]) {
      const data = {
        [lists.docs.dateRead.key]: new Date().toISOString(),
        [lists.docs.hasRead.key]: true,
      };
      this.handleUpdateItem(data, item.Id);
    }
  }

  /**
   * Handles clicking the 'Acknowledge' button
   * from withing the acknowledgment modal
   */
  handleClickAck = () => {
    const data = {
      [lists.docs.dateAck.key]: new Date().toISOString(),
      [lists.docs.hasAck.key]: true,
    };

    this.handleUpdateItem(data, this.state.currentItem)
      .then(this.handleToggleAck);
  }

  /**
   * Handles toggling the acknowledgment modal
   * @param {object} item   - item user is acknowledging
   */
  handleToggleAck = (item) => {
    const id = item ? item.Id : null;
    this.setState({
      acknowledgeHidden: !this.state.acknowledgeHidden,
      currentItem: id,
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
      <div>

        <h1>SPA</h1>

        <Search onChange={this.handleSearch} />

        <List
          items={this.state.filteredItems}
          columns={this.state.columns}
          onColumnHeaderClick={this.handleClickColumn}
        />

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
