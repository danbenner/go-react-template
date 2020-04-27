
import React from 'react';
import { Grid } from '@material-ui/core';
import CustomTable from '../CustomTable';
import CustomChart from '../CustomChart';
// import CustomCard from '../CustomCard';
// import { CheckHostname } from '../../utils/tools';

class Redemptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      route: 'api/redemptions/errors',
      initialRowLimit: 10,
    };
  }

  render() {
    const {
      route, initialRowLimit,
    } = this.state;
    return (
      <div>
        <Grid
          justify="space-evenly"
          container
          spacing={2}
        >
          <Grid item>
            <CustomChart
              route="api/trace/funding"
              limit={24}
              offset={0}
              width={800}
              typeOfChart="line"
            />
          </Grid>
          <Grid item>
            <CustomTable
              aria-label="redemptions"
              tableTitle="Redemptions Errors"
              route={route}
              initialLimit={initialRowLimit}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Redemptions;
