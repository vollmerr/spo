import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

const Loading = ({ label = 'loading...' }) => (
  <Spinner
    size={SpinnerSize.large}
    label={label}
    ariaLive={'assertive'}
  />
);

export default Loading;

