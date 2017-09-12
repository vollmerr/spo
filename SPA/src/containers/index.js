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
      },
      {
        key: lists.docs.dateRead.key,
        name: lists.docs.dateRead.name,
        ariaLabel: lists.docs.dateRead.ariaLabel,
        columnActionsMode: 2,
        maxWidth: 200,
        minWidth: 100,
        isSorted: false,
        isSortedDescending: false,
        isResizable: true,
        onRender: item => item[lists.docs.dateRead.key].slice(0, 10)
      },
      {
        key: lists.docs.dateAck.key,
        name: lists.docs.dateAck.name,
        ariaLabel: lists.docs.dateAck.ariaLabel,
        columnActionsMode: 2,
        maxWidth: 200,
        minWidth: 100,
        isSorted: false,
        isSortedDescending: false,
        isResizable: true,
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
   * FIXME! Does not sort very well...
   * Handles clicking on a column header
   * @param {event} event     - onClick event
   * @param {object} column   - column clicked on
   */
  handleClickColumn = (event, column) => {
    const { items, columns } = this.state;
    let isSortedDescending = column.isSortedDescending;

    // If we've sorted this column, flip it.
    if (column.isSorted) {
      isSortedDescending = !isSortedDescending;
    }

    const sortedItems = items.sort((a, b) => {
      const value1 = a[column.key];
      const value2 = b[column.key];
      const dateValue1 = Date.parse(value1);
      const dateValue2 = Date.parse(value2);

      // is a date
      if (!isNaN(dateValue1) && !isNaN(dateValue2)) {
        if (isSortedDescending) {
          return dateValue1 > dateValue2 ? -1 : 1;
        } else {
          return dateValue1 > dateValue2 ? 1 : -1;
        }
      }

      // not a date or both are null
      if (isSortedDescending) {
        return value1 > value2 ? -1 : 1;
      } else {
        return value1 > value2 ? 1 : -1;
      }
    });

    const sortedColumns = columns.map(col => {
      col.isSorted = (col.key === column.key);

      if (col.isSorted) {
        col.isSortedDescending = isSortedDescending;
      }

      return col;
    });

    // Reset the items and columns to match the state.
    this.setState({
      items: sortedItems,
      filteredItems: sortedItems,
      columns: sortedColumns,
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
        [lists.docs.dateRead.key]: new Date().toLocaleDateString(),
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
      [lists.docs.dateAck.key]: new Date().toLocaleDateString(),
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

    this.setState({ filteredItems });
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
