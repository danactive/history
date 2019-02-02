/* global document */
import moment from 'moment';
import momentPropTypes from 'react-moment-proptypes';
import 'react-dates/initialize';
import { isInclusivelyBeforeDay, SingleDatePicker } from 'react-dates';
import React from 'react';

import Rename from './rename';

function assembleControls(dateComponent) {
  const domControl = document.getElementById('controls');
  const hasImage = (domControl && domControl.getAttribute('data-has-image') === 'true');

  if (hasImage) {
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

    const dateComponent = (
      <SingleDatePicker
        {...this.props}
        key="date_input"
        date={date}
        focused={focused}
        onDateChange={this.onDateChange}
        onFocusChange={this.onFocusChange}
        isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
      />
    );

    return assembleControls(dateComponent);
  }
}

Controls.defaultProps = {
  date: moment(),
};

const datePropType = momentPropTypes.momentObj;

Controls.propTypes = {
  date: datePropType,
};

module.exports = Controls;