import React from 'react';
import ButtonRead from './ButtonRead';
import ButtonAck from './ButtonAck';

const ListButtons = ({ item, onClickRead, onClickAck }) => (
  <div>
    <ButtonRead item={item} onClick={onClickRead} />
    <ButtonAck item={item} onClick={onClickAck} />
  </div>
);

export default ListButtons;
