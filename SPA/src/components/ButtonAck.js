import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import lists from '../api/lists';

const ButtonAck = ({ item, onClick }) => (
  !item[lists.docs.hasAck.key] ?
    <PrimaryButton
      disabled={!item[lists.docs.hasRead.key]}
      onClick={onClick}
    >
      Acknowledge
    </PrimaryButton>
    :
    null
);

export default ButtonAck;
