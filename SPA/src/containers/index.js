import React, { Component } from 'react';

import * as sp from '../api/sp';
import lists from '../api/lists';

// import Search from '../components/Search';
import ListContainer from './ListContainer';
// import ListButtons from '../components/ListButtons';
import Loading from '../components/Loading';

class App extends Component {
  constructor() {
    super();
    this.state = {
      items: {
        all: [],
        notAck: [],
        hasAck: [],
      },
      docs: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.loadAckList()
      .then(this.loadDocs)
      .then(this.mapDocLinks)
      .then(this.mapItemsToLists)
      .then(this.toggleLoading);
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
          .orderBy(lists.ack.dateRead.key)
          .orderBy(lists.ack.dateAck.key)
          .get()
      ))
      .then(data => {
        const items = { ...this.state.items };
        items.all = data;
        this.setState({ items });
      })
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
    const items = { ...this.state.items };
    items.all = items.all.map(item => ({
      ...item,
      href: this.state.docs.find(x => x.Id === item[lists.ack.docId.key]).ServerRedirectedEmbedUrl,
    }));
    this.setState({ items });
  }

  toggleLoading = () => this.setState({ loading: !this.state.loading })

  mapItemsToLists = () => {
    const items = { ...this.state.items };

    items.all.forEach(item => {
      if (item[lists.ack.hasRead.key] && item[lists.ack.hasAck.key]) {
        items.hasAck.push(item);
      } else {
        items.notAck.push(item);
      }
    });

    this.setState({ items });
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
        const items = { ...this.state.items };
        const index = items.all.findIndex(x => x.Id === id);
        items.all[index] = {
          ...items[index],
          ...data,
        };

        this.setState({ items });
      })
      .then(this.mapItemsToLists)
      .catch(err => console.error(err))
  )

  render() {
    return (
      <div>
        <h1 style={{ marginLeft: '10px' }}>SPA</h1>

        {
          this.state.loading ?
            <Loading />
            :
            <div>
              <ListContainer
                title={'Pending Acknowledgment'}
                items={this.state.items.notAck}
                handleUpdateItem={this.handleUpdateItem}
              />
              <ListContainer
                title={'Previous'}
                items={this.state.items.hasAck}
                handleUpdateItem={this.handleUpdateItem}
              />
            </div>
        }
      </div>
    );
  }
}

export default App;
