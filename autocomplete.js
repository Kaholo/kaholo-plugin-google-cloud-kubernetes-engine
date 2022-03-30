const parsers = require("./parsers");
const GKEService = require("./gke.service");

// auto complete helper methods

const MAX_RESULTS = 10;

function mapAutoParams(autoParams) {
  const params = {};
  autoParams.forEach((param) => {
    params[param.name] = parsers.autocomplete(param.value);
  });
  return params;
}

/** *
 * @returns {[{id, value}]} filtered result items
 ** */
function handleResult(result, query, parseFunc) {
  const items = result.map(parseFunc || getParseFromParam("id", "name"));
  return filterItems(items, query);
}

function getAutoResult(id, value) {
  return {
    id: id || value,
    value: value || id,
  };
}

function getParseFromParam(idParamName, valParamName) {
  if (valParamName) { return (item) => getAutoResult(item[idParamName], item[valParamName]); }
  return (item) => getAutoResult(item[idParamName]);
}

function filterItems(items, query) {
  let resolvedItems = items;
  if (query) {
    const qWords = query.split(/[. ]/g).map((word) => word.toLowerCase()); // split by '.' or ' ' and make lower case
    resolvedItems = resolvedItems.filter((item) => (
      qWords.every((word) => item.value.toLowerCase().includes(word))
    ));
    resolvedItems = resolvedItems.sort((word1, word2) => (
      word1.value.toLowerCase().indexOf(qWords[0]) - word2.value.toLowerCase().indexOf(qWords[0])
    ));
  }
  return resolvedItems.splice(0, MAX_RESULTS);
}

function listAuto(listFunc, fields, paging, noProject, parseFunc) {
  let resolvedFields = fields;
  let resolvedParseFunc = parseFunc;
  if (!resolvedFields) { resolvedFields = ["id", "name"]; }
  if (!resolvedParseFunc && resolvedFields) {
    resolvedParseFunc = getParseFromParam(...resolvedFields);
  }
  return async (query, pluginSettings, actionParams) => {
    const resolvedQuery = (query || "").trim();
    try {
      const settings = mapAutoParams(pluginSettings);
      const params = mapAutoParams(actionParams);
      const client = GKEService.from(params, settings, noProject);
      const items = [];
      let nextPageToken;
      params.query = resolvedQuery;
      // TODO: Remove awaits in loop
      // eslint-disable-next-line
      while (true) {
        // eslint-disable-next-line
        const result = (await client[listFunc](params, resolvedFields, nextPageToken)) || [];
        items.push(...handleResult(result.items || result, resolvedQuery, resolvedParseFunc));
        if (!paging || !resolvedQuery || !result.nextPageToken || items.length >= MAX_RESULTS) {
          return items;
        }
        const exactMatch = items.find((item) => (
          item.value.toLowerCase() === resolvedQuery.toLowerCase()
          || item.id.toLowerCase() === resolvedQuery.toLowerCase()
        ));
        if (exactMatch) { return [exactMatch]; }
        nextPageToken = result.nextPageToken;
      }
    } catch (err) {
      throw new Error(`Problem with '${listFunc}': ${err.message || err}`);
    }
  };
}

async function listMachineTypesWithCustomAuto(query, pluginSettings, triggerParameters) {
  let resolvedQuery = query;
  try {
    const settings = mapAutoParams(pluginSettings); const
      params = mapAutoParams(triggerParameters);
    const client = GKEService.from(params, settings);
    let nextPageToken;
    resolvedQuery = (resolvedQuery || "").trim();
    const items = filterItems([{ id: "custom", value: "Custom N1(Default Custom)" },
      { id: "n2-custom", value: "Custom N2" },
      { id: "n2d-custom", value: "Custom N2D" },
      { id: "e2-custom", value: "Custom E2" }], resolvedQuery);
    if (resolvedQuery.toLowerCase().includes("custom")) { return items; }
    // TODO: Remove awaits in loop
    // eslint-disable-next-line
    while (true) {
      // eslint-disable-next-line
      const result = await client.listMachineTypes(params, ["name"], nextPageToken);
      items.push(...handleResult(result.items, resolvedQuery, getParseFromParam("name")));
      if (!result.nextPageToken || !resolvedQuery || items.length >= MAX_RESULTS) { return items; }
      const exactMatch = items.find((item) => (
        item.value.toLowerCase() === resolvedQuery.toLowerCase()
        || item.id.toLowerCase() === resolvedQuery.toLowerCase()
      ));
      if (exactMatch) { return [exactMatch]; }
      nextPageToken = result.nextPageToken;
    }
  } catch (err) {
    throw new Error(`Problem with 'listMachineTypesAuto': ${err.message || err}`);
  }
}

module.exports = {
  listClustersAuto: listAuto("listClusters"),
  listNodePoolsAuto: listAuto("listNodePools"),
  listProjectsAuto: listAuto("listProjects", ["projectId", "name"], false, true),
  listRegionsAuto: listAuto("listRegions", ["name"]),
  listZonesAuto: listAuto("listZones", ["name"]),
  listServiceAccountsAuto: listAuto("listServiceAccounts", ["email", "displayName"]),
  listMachineTypesAuto: listAuto("listMachineTypes", ["name"]),
  listMachineTypesWithCustomAuto,
  listNetworks: listAuto("listNetworks"),
  listSubnetworks: listAuto("listSubnetworks"),
};
