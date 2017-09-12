import React from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';

const Acknowledgment = ({
  hidden,
  onConfirm,
  onDismiss,
}) => (
  <Dialog
    hidden={hidden}
    onDismiss={onDismiss}
    dialogContentProps={{
      type: DialogType.close,
      title: 'Acknowledgment',
      subText: 'By clicking "Acknowledge" below, you agree that you have read and accept all terms and conditions specified in "NAME OF DOC + LINK TO IT".',
    }}
    modalProps={{
      titleAriaId: 'myLabel',
      subtitleAriaId: '',
      isBlocking: false,
      containerClassName: 'ms-dialogMainOverride',
    }}
  >
    <DialogFooter>
      <PrimaryButton onClick={onConfirm} text={'Acknowledge'} />
      <DefaultButton onClick={onDismiss} text={'Cancel'} />
    </DialogFooter>
  </Dialog>
);

export default Acknowledgment;
