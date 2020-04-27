/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Redemptions from '../Admin/Redemptions';
import { CheckHostname } from '../../utils/tools';

const styles = () => ({
  grid: {
    display: 'grid',
  },
});

function PrivateRoute({ children, path, auth }) {
  return (
    <Route
      path={path}
      render={() => (auth ? (
        children
      ) : (
        <Redirect to="/" />
      ))}
    />
  );
}

// Fetch AD Groups from backend/api/adGroups, returns slice of Authorized Group names
//  - also uses a Hook to 'handle' updating the component when the fetch returns
function fetchData(route, handler) {
  const baseURL = CheckHostname(window.location.hostname);
  const url = baseURL.concat(route);
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`ERROR: Status[${response.status}], JSON:[${JSON.stringify(response.json)}]`);
    })
    .then((data) => {
      handler(data);
    })
    .catch((error) => console.log(`ERROR: fetching data for Content.jsx, PrivateRoutes: ${error}`));
}

/**
 * CONTENT:
 *  - This component is used by Theme.jsx, it provides the React Router
 *  - PrivateRoute(s) are also enabled, controlled by a backend endpoint for authorized group names
 */
function Content(props) {
  const [auth, setAuth] = useState(false);
  const { userAdGroups } = props;
  // NOTE: this route is specified in go/controllers/admin_controller.go line(s):28-32,
  //  it's literally calling an endpoint on the backend
  const route = 'api/adGroups';
  useEffect(() => {
    function handleGroupsUpdate(data) {
      const parseAdGroups = userAdGroups.split(',');
      for (let index = 0; index < data.length; index++) {
        const subGroup = data[index];
        if (parseAdGroups.includes(subGroup)) {
          setAuth(true);
        }
      }
    }
    fetchData(route, handleGroupsUpdate);
  }, []);

  return (
    <div>
      <Switch>
        <Route path="/">
          <h1>This is the HOME page</h1>
        </Route>
        <Route path="/this/route/must/match/in/Navigator/pages">
          <h1>This is another page of content</h1>
        </Route>
        <PrivateRoute path="/seriously/this/needs/to/match" auth={auth}>
          <Redemptions />
        </PrivateRoute>
        {/* NOTE: notice here, that all we're doing is redirecting from '/', which is usually home path */}
        {/* <Redirect from="/" to="/this/route/must/match/in/Navigator/pages" /> */}
      </Switch>
    </div>
  );
}

export default withStyles(styles)(Content);
