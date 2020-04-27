import React from 'react';
import Cookies from 'universal-cookie';
import { BrowserRouter as Router } from 'react-router-dom';
import SinglePageApp from '../components/SinglePageApp/Theme';

// Get user's CN# & AD Groups
const cookies = new Cookies();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      portalUserID: cookies.get('sessionUserID'),
      adGroups: cookies.get('userADGroups'),
    };
  }

  render() {
    const { portalUserID, adGroups } = this.state;

    return (
      <Router>
        <SinglePageApp
          headerID={portalUserID}
          adGroups={adGroups}
        />
      </Router>
    );
  }
}

export default App;
