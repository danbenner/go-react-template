import React from 'react';
import {
  AppBar,
  Grid,
  Toolbar,
  IconButton,
} from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { CheckHostname } from '../../utils/tools';

/**
 * HEADER:
 *  - Unique AppBar for displaying userID
 *  - (optional) 'Logout' button included for easy testing
 */

// NOTE: another unique value from previous project
function Header(props) {
  const userID = props.portalUserID;

  return (
    <>
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs />
            <Grid aria-label="userID" item>
              { userID }
            </Grid>
            <Grid item>
              <IconButton aria-label="logout" href={CheckHostname(window.location.hostname).concat('logout')}>
                <ExitToAppIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Header;
