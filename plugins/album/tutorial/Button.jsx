'use strict';
import React from 'react';

class Button extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className={this.props.className}>
        {this.props.label}
      </div>
    )
  }
}

Button.propTypes = {
  label: React.PropTypes.string,
  className: React.PropTypes.string
}

Button.defaultProps = {
  label: 'button',
  className: 'default-class'
}

export default Button
