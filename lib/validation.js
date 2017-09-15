const joi = require('joi');

module.exports = {
  albumStem: joi.string().regex(/^[a-z0-9_-]{1,25}$/gi).required().example('country2017'),
  gallery: joi.string().regex(/^[a-z0-9_-]{1,25}$/gi).required().example('vacations'),
  geocode: joi.string().regex(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/).example('49.25,-123.1'),
  raw: joi.boolean().truthy('true').falsy('false').default(false)
};
