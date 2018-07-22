const joi = require('joi');

module.exports = {
  albumStem: joi.string().regex(/^[a-z0-9_-]{1,25}$/gi).required().example('country2017'),
  cloudProviders: joi.string().valid('dropbox'),
  filenames: joi.array().items(joi.string().regex(/^[-\w^&'@{}[\],$=!#().%+~ ]+$/))
    .min(1).max(80)
    .required()
    .example('["DSC01229.JPG"]'),
  gallery: joi.string().regex(/^[a-z0-9_-]{1,25}$/gi).required().example('vacations'),
  geocode: joi.string().regex(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/).example('49.25,-123.1'),
  prefix: joi.string().isoDate().raw().required()
    .example('2016-12-31'),
  preview: joi.boolean().truthy('true').falsy('false').default(false),
  raw: joi.boolean().truthy('true').falsy('false').default(false),
  renameAssociated: joi.boolean().truthy('true').falsy('false').default(false)
    .description('JPG and RAW or video and still image are common associated pairs that should rename together'),
  resize: joi.boolean().truthy('true').falsy('false').default(true),
  sources: joi.string(),
  sourceFolder: joi.string().trim().example('/public/todo/'),
  w: joi.number(),
  h: joi.number(),
  xml: joi.string().required().regex(/<item\b[^>]*>(.*?)<\/item>/)
    .example('<item id="1"><filename>2016-12-31-37.jpg</filename></item>'
      + '<item id="2"><filename>2016-12-31-64.jpg</filename></item>'
      + '<item id="3"><filename>2016-12-31-90.jpg</filename></item>')
};
