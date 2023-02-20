const fs = require("fs");

function parseArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof (value) === "string") {
    return value.split("\n").map((line) => line.trim()).filter((line) => line);
  }
  throw new Error("Unsupported array format");
}

module.exports = {
  boolean: (value) => {
    if (!value || value === "false") {
      return false;
    }
    return true;
  },
  text: (value) => {
    if (value) {
      return value.split("\n");
    }
    return undefined;
  },
  number: (value) => {
    if (!value) {
      return undefined;
    }
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`Value ${value} is not a valid number`);
    }
    return parsed;
  },
  autocomplete: (value, getVal) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return (getVal ? value.value : value.id) || value;
    }
    return value;
  },
  autocompleteOrArray: (value) => {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof (value) === "object") {
      return [value.id || value];
    }
    return [value];
  },
  tags: (value, letKeyOnly) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      const obj = {};
      value.split("\n").forEach((line) => {
        const [key, ...val] = line.trim().split("=");
        if (!key || (!letKeyOnly && !val)) {
          throw new Error("bad labels/tags format");
        }
        if (val.length) {
          obj[key] = val.join("=");
        } else {
          obj[key] = "";
        }
      });
      return obj;
    }
    throw new Error(`Value ${value} is not a valid tags/labels input.`);
  },
  jsonString: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "object") {
      return value;
    }
    if (typeof (value) === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        throw new Error(`Invalid JSON! ${e.message}`);
      }
    }
    throw new Error(`Value ${value} is not an object`);
  },
  objectOrFromPath: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      if (!fs.existsSync(value)) {
        throw new Error(`Couldn't find file '${value}'.`);
      }
      const fileContent = fs.readFileSync(value, "utf8");
      try {
        const obj = JSON.parse(fileContent);
        return obj;
      } catch {
        throw new Error(`The file '${value}' doesn't contain a valid JSON.`);
      }
    }
    if (typeof (value) === "object") {
      return value;
    }
    throw new Error(`value ${value} is not a valid object or a file path`);
  },
  string: (value) => {
    if (!value) {
      return undefined;
    }
    if (typeof (value) === "string") {
      return value.trim();
    }
    throw new Error(`Value ${value} is not a valid string`);
  },
  array: parseArray,
};
