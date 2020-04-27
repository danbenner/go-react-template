/* eslint-disable no-nested-ternary */
/* eslint-disable object-curly-newline */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  FormControlLabel,
  Switch,
  Paper,
  MenuItem,
  FormHelperText,
  FormControl,
  Select,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { CheckHostname } from '../utils/tools';

/**
 * NoSQLTable is designed to handle: names[string], objects[object], and rows (which is total count)
 *  - Head maps the names, for each name: create a <TableCell>
 *  - Body maps the objects, for each object: create a <Row>
 *    - Row maps the obj.values, for each value: create a <TableCell>
 *      - if value is equal to an object, we're forced to JSON.stringify (or 'flatten')
 *  - NOTES:
 *    - Because this was designed to work with JSON from a NoSQL database, this allows for
 *      nested objects, which brings up the concern of how to display them.
 *      OPTIONS:
 *        1) JSON.stringify the object. Easy, fast, reliable, but not elegant.
 *        2) array.flat() the entire object, including nested objects. More verbose, however
 *          the table grows unlimited horizontally, therefore gathering COLUMN names changes.
 */

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 650,
  },
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'sticky',
    bottom: 0,
  },
  grid: {
    display: 'grid',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: '1%',
  },
  formControl: {
    // margin: theme.spacing(1),
  },
  selectEmpty: {
    // marginTop: theme.spacing(2),
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles();
  const { count, page, rowsPerPage, handleChangePage } = props;

  const handleFirstPageButtonClick = (event) => {
    handleChangePage(event, 0, 0);
  };

  const handleBackButtonClick = (event) => {
    handleChangePage(event, page - 1, (page - 1) * rowsPerPage);
  };

  const handleNextButtonClick = (event) => {
    handleChangePage(event, page + 1, (page + 1) * rowsPerPage);
  };

  const handleLastPageButtonClick = (event) => {
    const m = Math.max(0, Math.ceil(count / rowsPerPage) - 1);
    handleChangePage(event, m, m * rowsPerPage);
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton>
        {page + 1}
        -
        {Math.ceil(count / rowsPerPage)}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
}

/**
 * Given a single object and it's ID which is its KEY;
 * - map its VALUES
 * - For each value, check whether it's an 'Object';
 *  - if not an object, then check it's length;
 *    - if length above threshold, use Tooltip instead for full value and get slice of value for Table
 *  - if an object, JSON.stringify() the value, which is similar to 'flattening' the data
 */
function Row(obj, id) {
  const { singleObject } = obj;
  const values = Object.values(singleObject);
  return (
    <TableRow key={id}>
      {values.map((val) => (
        (typeof val !== 'object')
          ? (val.length > 15)
            ? (
              <Tooltip title={val} arrow>
                <TableCell key={val + obj.id} align="left">{val.slice(0, 10)}</TableCell>
              </Tooltip>
            )
            : <TableCell key={val + obj.id} align="left">{val}</TableCell>
          : (
            <Tooltip title={JSON.stringify(val)} arrow>
              <TableCell key={val + obj.id} align="left">&#123;Object&#125;</TableCell>
            </Tooltip>
          )
      ))}
    </TableRow>
  );
}

function NoSQLTable(props) {
  const classes = useStyles();
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(props.initialLimit);
  const {
    tableTitle, objects, columnNames, rows, fetchNewData,
  } = props;

  const handleChangePage = (event, newPage, offset) => {
    fetchNewData((newPage + 1) * rowsPerPage, offset);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    fetchNewData(event.target.value, 0);
    setRowsPerPage(event.target.value);
    if (event.target.value >= 25) {
      setDense(true);
    } else if (event.target.value <= 5) {
      setDense(false);
    }
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const styles = {
    titleStyle: {
      display: 'flex',
      justifyContent: 'center',
    },
    rowA: {
      backgroundColor: '#e6e6e6',
    },
    rowB: {
      backgroundColor: '#a6a6a6',
    },
  };

  return (
    <>
      {(columnNames.length < 1 && objects.length < 1)
        ? (
          <Card>
            <CardContent>
              <Typography gutterBottom>
                No Redemption Errors
              </Typography>
            </CardContent>
          </Card>
        )
        : (
          <div className={classes.grid}>
            <TableContainer component={Paper}>
              {/* --------------------- TITLE -------------------- */}
              <div style={styles.titleStyle}>
                <h3>{tableTitle}</h3>
              </div>
              <Table className={classes.table} size={dense ? 'small' : 'medium'} aria-label="a dense table">
                {/* ------------------- HEADER ------------------- */}
                <TableHead>
                  <TableRow>
                    {columnNames.map((name) => (
                      <TableCell key={name} align="left"><b>{name}</b></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {/* -------------------- BODY -------------------- */}
                <TableBody>
                  {objects
                    .map((obj) => (
                      <Row id={obj.id} singleObject={obj} />
                    ))}
                </TableBody>
              </Table>
              {/* ------------------- NAVIGATION ----------------- */}
              <div className={classes.footer}>
                <FormControl className={classes.formControl}>
                  <Select value={rowsPerPage} onChange={handleChangeRowsPerPage} displayEmpty className={classes.selectEmpty}>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={250}>250</MenuItem>
                  </Select>
                  <FormHelperText>Rows</FormHelperText>
                </FormControl>
                <TableFooter>
                  <TableRow>
                    <TablePaginationActions
                      count={rows}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      handleChangePage={handleChangePage}
                    />
                  </TableRow>
                </TableFooter>
                <FormControlLabel
                  control={<Switch checked={dense} onChange={handleChangeDense} />}
                  label="Dense"
                />
              </div>
            </TableContainer>
          </div>
        )}
    </>
  );
}

/**
 * CustomTable:
 *  - GOAL: fetch from mongodb 'tableName' collection
 *  - NOTE: every mongodb call returns { arrayOfObjects: [{object}], totalDocumentCount: 0 }
 *  - SETUP:
 *    - using unique route, call api with limit (total) and offset (limit - rowsPerPage)
 *    - decipher keys, store objects in value, set state accordingly
 *    - render component, while passing objects[], columnNames, rows (count), and method to fetch more
 *  - OTHER NOTES:
 *    - this component can be used elsewhere for similar mongodb calls, only changes are:
 *      - state.route, state.initialLimit
 *      - verifying new route offers limit and offset query parameters
 *      - verifying new route's api returns the same object:
 *        - { arrayOfObjects: [{object}], totalDocumentCount: 0 }
 */

class CustomTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BASEURL: CheckHostname(window.location.hostname),
      tableTitle: props.tableTitle,
      objects: [],
      columnNames: [], // keys from first object in array (assuming all objects are same)
      route: props.route,
      // NOTE: *** limit MUST EQUAL NoSQLTable's INITIAL rowsPerPage ***
      limit: props.initialLimit, // 'offset + rowsPerPage'
      offset: 0, // 'page * limit - rowsPerPage'
      rows: 1, // Count returned from fetch
      isLoading: false,
      error: null,
    };
    this.fetchData = this.fetchData.bind(this);
    this.fetchMoreData = this.fetchMoreData.bind(this);
  }

  componentDidMount() {
    const { route, limit, offset } = this.state;
    this.fetchData(route, limit, offset);
  }

  fetchData(route, limit, offset) {
    const { BASEURL } = this.state;
    const url = BASEURL.concat(`${route}?limit=${limit}&offset=${offset}`);
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`ERROR: Status[${response.status}], JSON:[${JSON.stringify(response.json)}]`);
      })
      .then((data) => {
        const keys = Object.keys(data);
        if (data[keys[0]] === null) {
          this.setState({
            limit,
            offset,
            isLoading: false,
          });
        } else {
          this.setState({
            objects: data[keys[0]],
            columnNames: Object.keys(data[keys[0]][0]),
            limit,
            offset,
            rows: data.totalDocumentCount,
            isLoading: false,
          });
        }
      })
      .catch((error) => this.setState({ error, isLoading: false }));
  }

  fetchMoreData(limit, offset) {
    this.fetchData(this.state.route, limit, offset);
  }

  render() {
    const {
      tableTitle,
      objects,
      columnNames,
      rows,
      limit,
      isLoading,
      error,
    } = this.state;

    if (error) {
      return (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          {error.message}
        </Alert>
      );
    }

    if (isLoading) {
      return <LinearProgress />;
    }

    return (
      <NoSQLTable
        tableTitle={tableTitle}
        objects={objects}
        columnNames={columnNames}
        rows={rows}
        initialLimit={limit}
        fetchNewData={this.fetchMoreData}
      />
    );
  }
}

export default CustomTable;
