import React from 'react';
import { DetailsList, CheckboxVisibility, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';

const List = ({ items, columns, onColumnHeaderClick }) => (
  <DetailsList
    items={items}
    columns={columns}
    checkboxVisibility={CheckboxVisibility.hidden}
    layoutMode={DetailsListLayoutMode.justified}
    onColumnHeaderClick={onColumnHeaderClick}
  />
);

export default List;
