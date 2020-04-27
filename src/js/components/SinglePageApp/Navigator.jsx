/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import LoyaltyIcon from '@material-ui/icons/Loyalty';

const pages = [
  {
    id: 'User',
    children: [
      {
        id: 'id is used as a javascript "key", so it MUST be unique',
        to: '/this/route/must/match/in/Navigator/pages',
        title: 'Title Displayed in Tab System',
        icon: <LoyaltyIcon />, // NOTE: any icon you want!
        active: true, // NOTE: only *ONE* page can have this set in here
      },
    ],
  },
  {
    id: 'Admin',
    children: [
      {
        id: 'AnotherID',
        to: '/seriously/this/needs/to/match',
        title: 'Narf!',
        icon: <ErrorIcon />, // have fun with the icons
      },
    ],
  },
];

const styles = (theme) => ({
  categoryHeader: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  categoryHeaderPrimary: {
    color: theme.palette.common.white,
  },
  item: {
    paddingTop: 1,
    paddingBottom: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover,&:focus': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  itemCategory: {
    backgroundColor: '#232f3e',
    boxShadow: '0 -1px 0 #404854 inset',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  navTitle: {
    fontSize: 24,
    color: theme.palette.common.white,
  },
  itemActiveItem: {
    color: '#4fc3f7',
  },
  itemPrimary: {
    fontSize: 'inherit',
  },
  itemIcon: {
    minWidth: 'auto',
    marginRight: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(2),
  },
});

/**
 * NAVIGATOR:
 *  - This the the LEFT-SIDE Tab/Link system
 *  - The 'pages' array contains every 'page' to be displayed in the sidebar
 *  - the 'id' is the tab/link key set during construction
 *  - the 'to' is the React.Router 'path', defined in Content.jsx
 *  - the 'title' is the title displayed
 *  - NOTE: the children cannot have children (yet)
 */

function Navigator(props) {
  const { classes, ...other } = props;

  const NavTitle = 'Name of the Project!';

  // NOTE: 'title' is passed in from pages[] (above)
  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem aria-label="main title" className={clsx(classes.navTitle, classes.item, classes.itemCategory)}>
          { NavTitle }
        </ListItem>
        {pages.map(({ id, children }) => (
          <React.Fragment key={id}>
            <ListItem className={classes.categoryHeader}>
              <ListItemText
                classes={{
                  primary: classes.categoryHeaderPrimary,
                }}
              >
                {id}
              </ListItemText>
            </ListItem>
            {children.map(({
              id: childId, to, title, icon, active,
            }) => (
              <Link
                key={childId}
                to={to}
                classes={{
                  primary: classes.itemPrimary,
                }}
              >
                <ListItem
                  button
                  className={clsx(classes.item, active && classes.itemActiveItem)}
                >
                  <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                  <ListItem id={to} button className={classes.button}>
                    <ListItemText
                      classes={{
                        primary: classes.itemPrimary,
                      }}
                    >
                      { title }
                    </ListItemText>
                  </ListItem>
                </ListItem>
              </Link>
            ))}
            <Divider className={classes.divider} />
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}

export default withStyles(styles)(Navigator);
