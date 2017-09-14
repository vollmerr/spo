import React from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import lists from '../api/lists';

const ButtonRead = ({ item, onClick }) => {
  const Button = item[lists.ack.hasRead.key] ? DefaultButton : PrimaryButton;

  return (
    <Button
      href={item.href}
      target={'_blank'}
      onClick={onClick}
    >
      Read
    </Button>
  );
}

export default ButtonRead;
