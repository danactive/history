import propTypes from 'prop-types';
import { SingleDatePicker } from 'react-dates';
import React from 'react';

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      date: props.date
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

    return (
      <SingleDatePicker
        {...this.props}
        id="date_input"
        date={date}
        focused={focused}
        onDateChange={this.onDateChange}
        onFocusChange={this.onFocusChange}
      />
    );
  }
}

Controls.defaultProps = {
  date: null
};

Controls.propTypes = {
  date: propTypes.bool
};

module.exports = Controls;
