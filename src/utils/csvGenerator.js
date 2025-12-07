const { Parser } = require('json2csv');

const generateCSV = (data, fields) => {
  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = generateCSV;
