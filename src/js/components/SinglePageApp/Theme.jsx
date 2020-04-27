import React from 'react';
import { createMuiTheme, ThemeProvider, withStyles } from '@material-ui/core/styles';
import {
  CssBaseline,
  Hidden,
  Typography,
  Link,
} from '@material-ui/core';
import Navigator from './Navigator';
import Header from './Header';
// import MemberSelector from './MemberSelector';
import Content from './Content';

let theme = createMuiTheme({
  palette: {
    primary: {
      light: '#a0c0d6', // ##4FC3F7
      main: '#005986', // #009be5
      dark: '#006db3',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  overrides: {
    MuiToolbar: {
      root: {
        color: '#353535',
        background: '#a0c0d6',
      },
    },
    MuiDrawer: {
      paper: {
        backgroundColor: '#18202c',
      },
    },
    MuiButton: {
      label: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: theme.palette.common.white,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        margin: '0 16px',
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up('md')]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#404854',
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
        marginRight: 0,
        '& svg': {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
};

const drawerWidth = 256;

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  app: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    whiteSpace: 'nowrap',
    padding: theme.spacing(6, 4),
    background: '#d6d6d6',
  },
  footer: {
    padding: theme.spacing(2),
    background: '#d6d6d6',
  },
};

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      <Link color="inherit" href="https://{WEBSITE}.com/">
        WEBSITE
      </Link>
      {' {YEAR}'}
    </Typography>
  );
}

/**
 * THEME:
 *  - This is the wrapper for the SPA
 *  - This is also where the styling is defining for the children components
 */

function Theme(props) {
  const { classes, headerID, adGroups } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // NOTE: portalUserID and adGroups are both from previous project, modify if necessary
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <nav className={classes.drawer}>
          <Hidden smUp implementation="js">
            <Navigator
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
            />
          </Hidden>
          <Hidden xsDown implementation="css">
            <Navigator aria-label="Navigator" PaperProps={{ style: { width: drawerWidth } }} />
          </Hidden>
        </nav>
        <div className={classes.app}>
          <header>
            <Header aria-label="Header" portalUserID={headerID} onDrawerToggle={handleDrawerToggle} />
          </header>
          <main className={classes.main}>
            <Content aria-label="Content" userAdGroups={adGroups} />
          </main>
          <footer aria-label="footer" className={classes.footer}>
            <Copyright />
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default withStyles(styles)(Theme);
