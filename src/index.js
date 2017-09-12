import React from 'react';
import ReactDOM from 'react-dom';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import App from './containers';
import './index.css';

ReactDOM.render(<Fabric><App/></Fabric>, document.getElementById('root'));