import pnp, { Web } from 'sp-pnp-js';

const DOCS_URL = '/sites/DevTest/SPAAdmin/Shared Documents';

export const web = () => pnp.sp.web;
export const admin = () => new Web('https://stateca.sharepoint.com/sites/DevTest/SPAAdmin/');

export const listItems = (title, site = web) => (
  site().lists.getByTitle(title).items
);

// export const getListItems = (title, site = web, filter = '') => (
//   site().lists.getByTitle(title).items.filter(filter).get()
// );

// export const getListItem = (title, Id, site = web) => (
//   site().lists.getByTitle(title).items.getById(Id).get()
// );

// export const newListItem = (title, data, site = web) => (
//   site().lists.getByTitle(title).items.add(data)
// );

// export const updateListItem = (title, id, data, site = web) => (
//   site().lists.getByTitle(title).items.getById(id).update(data)
// );

// export const deleteListItem = (title, id, site = web) => (
//   site().lists.getByTitle(title).items.getById(id).delete()
// );

export const getUser = (site = web) => (
  site().currentUser.get()
);

// export const openFile = (name, site = web) => (
//   site.getFolderByServerRelativeUrl(DOCS_URL)
//     .files
//     .getByName(name)
//     .get()
//     .catch(err => console.error(err))
// );

// FOR TESTING (pnp available in console)
export const globalPnp = () => {
  window.pnp = pnp;
  window.pnp_web = new Web('https://stateca.sharepoint.com/sites/DevTest/SPAAdmin');
};
