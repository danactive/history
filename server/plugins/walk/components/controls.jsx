import moment from 'moment';
import 'react-dates/initialize';
import { isInclusivelyBeforeDay, SingleDatePicker } from 'react-dates';
import React from 'react';

import Rename from './rename';

// This component is breaking since React is rendered on the server

function assembleControls(dateComponent, showControls) {
  if (showControls) {
    return (
      <section>
        <span>
          {dateComponent}
        </span>
        <Rename />
      </section>
    );
  }

  return <section />;
}

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      date: props.date,
    };

    this.onDateChange = this.onDateChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDateChange(date) {
    this.setState({ date });
  }

  onFocusChange({ focused }) {
    this.setState({ focused });
  }

  render() {
    const { focused, date } = this.state;
    const { showControls } = this.props;

    const dateComponent = (
      <SingleDatePicker
        key="date_input"
        date={date}
        focused={focused}
        onDateChange={this.onDateChange}
        onFocusChange={this.onFocusChange}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
      />
    );

    return assembleControls(dateComponent, !!showControls);
  }
}

module.exports = Controls;
