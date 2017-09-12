import React from 'react';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';

const Search = ({ onChange }) => (
  <div id={'search'}>
    <SearchBox onChange={onChange} />
  </div>
);

export default Search;
