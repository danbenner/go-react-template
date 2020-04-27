/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-array-index-key */
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Paper,
  CircularProgress,
} from '@material-ui/core';
import { CheckHostname } from '../utils/tools';

/**
 * Recharts Documentation -> [recharts](http://recharts.org/en-US/api)
 */

// ---------------------------------------------------------------------------------------------- //

// NOTE: data always comes back as an object, { objectName: { object } }
function fetchData(route, limit, offset, handler) {
  // console.log(`route: ${route}`);
  const baseURL = CheckHostname(window.location.hostname);
  const url = baseURL.concat(`${route}?limit=${limit}&offset=${offset}`);
  // console.log(`url: ${url}`);
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`ERROR: Status[${response.status}], JSON:[${JSON.stringify(response.json)}]`);
    })
    .then((data) => {
      const keys = Object.keys(data);
      handler(data[keys[0]]);
    })
    .catch((error) => console.log(`ERROR: fetching data for CustomChart: ${error}`));
}

/**
 * Verifies a value is a number, so the Chart can only display numbers
 */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Generates a random hexadecimal value for a color (i.e.: #43A19F)
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// ---------------------------------------------------------------------------------------------- //

/**
 * Types of Charts:
 *  - Params:
 *    + Required: route, limit, offset
 *    + Optional: width, typeOfChart
 *  - accepts a 'route' which designates the endpoint on the backend
 *  - accepts an optional 'width' property to allow for unique data to fit the screen
 *  - the Line(s) are dynamically allocated, but MUST have NUMERIC values, otherwise ignored
 *  - NOTE: there are many customizations that can be made to alter the appearance of the charts
 *    + example: try changing type="monotone" to "step"
 */

const styles = {
  Paper: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0px 30px 0px 0px',
  },
};

const CustomLineChart = (props) => {
  const { data, width } = props;
  const arrOfElements = Object.values(data);

  return (
    <Paper style={styles.Paper}>
      <ResponsiveContainer minWidth={500} width={width} aspect={4}>
        <LineChart
          data={data}
        >
          {/* 3 3 refers to the size of the dash */}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          {/* Tootip adds the hover-over displayed data */}
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {Object.keys(arrOfElements[0]).map((eKey) => (
            (!isNumber(arrOfElements[0][eKey]))
              ? <></>
              : <Line type="monotone" dataKey={eKey} stroke={getRandomColor()} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

const CustomAreaChart = (props) => {
  const { data, width } = props;
  const arrOfElements = Object.values(data);

  return (
    <Paper style={styles.Paper}>
      <ResponsiveContainer minWidth={500} width={width} aspect={4}>
        <AreaChart
          width={500}
          height={400}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {Object.keys(arrOfElements[0]).map((eKey) => (
            (!isNumber(arrOfElements[0][eKey]))
              ? <></>
              : <Area type="monotone" dataKey={eKey} stackId="1" fill={getRandomColor()} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

const CustomBarChart = (props) => {
  const { data, width } = props;
  const arrOfElements = Object.values(data);

  return (
    <Paper style={styles.Paper}>
      <ResponsiveContainer minWidth={500} width={width} aspect={4}>
        <BarChart
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {Object.keys(arrOfElements[0]).map((eKey) => (
            (!isNumber(arrOfElements[0][eKey]))
              ? <></>
              : <Bar dataKey={eKey} fill={getRandomColor()} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

/**
 * CustomChart:
 *  - uses hooks to handle updating the component when the fetch returns
 */
export default function CustomChart(props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const {
    route,
    limit,
    offset,
    width,
    typeOfChart,
  } = props;

  useEffect(() => {
    function handleDataUpdate(d) {
      setData(d);
      setLoading(false);
    }
    fetchData(route, limit, offset, handleDataUpdate);
  }, []);

  switch (typeOfChart) {
    case 'line':
      return (
        <>
          {(!loading)
            ? <CustomLineChart data={data} width={width} />
            : <CircularProgress />}
        </>
      );
    case 'area':
      return (
        <>
          {(!loading)
            ? <CustomAreaChart data={data} width={width} />
            : <CircularProgress />}
        </>
      );
    case 'bar':
      return (
        <>
          {(!loading)
            ? <CustomBarChart data={data} width={width} />
            : <CircularProgress />}
        </>
      );
    default:
      return (
        <>
          {(!loading)
            ? <CustomLineChart data={data} width={width} />
            : <CircularProgress />}
        </>
      );
  }
}
