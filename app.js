const {
  helpers: {
    temporaryFileSentinel,
  },
} = require('@kaholo/plugin-library');

const parsers = require("./parsers");
const autocomplete = require("./autocomplete");
const GKEService = require("./gke.service");
const { prependHttps } = require("./helpers");
const gcloudCli = require("./gcloud-cli");

async function createBasicCluster(action, settings) {
  const {
    name, locationType, zone, controlPlaneReleaseChannel, version, numberOfNodes,
    enableAutoscaling, minNode, maxNode, machineType, nodeImage, diskType,
    diskSize, diskEncryptionKey, waitForOperation, network, subnetwork,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.createBasicCluster({
    name: parsers.string(name),
    locationType,
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    controlPlaneReleaseChannel,
    version: parsers.string(version),
    numberOfNodes: parsers.number(numberOfNodes),
    enableAutoscaling: parsers.boolean(enableAutoscaling),
    minNode: parsers.number(minNode),
    maxNode: parsers.number(maxNode),
    machineType: parsers.autocomplete(machineType),
    nodeImage: parsers.autocomplete(nodeImage),
    diskType,
    diskSize: parsers.number(diskSize),
    diskEncryptionKey: parsers.string(diskEncryptionKey),
    waitForOperation: parsers.boolean(waitForOperation),
    network: parsers.autocomplete(network),
    subnetwork: parsers.autocomplete(subnetwork),
  });
}

async function createClusterJson(action, settings) {
  const {
    locationType, zone, clusterJson, waitForOperation,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.createClusterJson({
    locationType,
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    clusterJson: parsers.objectOrFromPath(clusterJson),
    waitForOperation: parsers.boolean(waitForOperation),
  });
}

async function createNodePool(action, settings) {
  const {
    zone, cluster, name, numberOfNodes, enableAutoscaling,
    minNode, maxNode, maxSurge, maxUnavailable, machineType, customMachineCpuCount,
    customMachineMem, nodeImage, diskType, diskSize, diskEncryptionKey, preemptible,
    maxPodsPerNode, networkTags, serviceAccount, saAccessScopes, enableIntegrityMonitoring,
    enableSecureBoot, labels, gceInstanceMetadata, version, waitForOperation,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.createNodePool({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
    nodePoolName: parsers.string(name),
    numberOfNodes: parsers.number(numberOfNodes),
    enableAutoscaling: parsers.boolean(enableAutoscaling),
    version: parsers.string(version),
    minNode: parsers.number(minNode),
    maxNode: parsers.number(maxNode),
    maxSurge: parsers.number(maxSurge),
    maxUnavailable: parsers.number(maxUnavailable),
    machineType: parsers.autocomplete(machineType),
    customMachineCpuCount: parsers.number(customMachineCpuCount),
    customMachineMem: parsers.number(customMachineMem),
    nodeImage: parsers.autocomplete(nodeImage),
    diskType,
    diskSize: parsers.number(diskSize),
    diskEncryptionKey: parsers.string(diskEncryptionKey),
    preemptible: parsers.boolean(preemptible),
    maxPodsPerNode: parsers.number(maxPodsPerNode),
    networkTags: parsers.array(networkTags),
    serviceAccount: parsers.autocomplete(serviceAccount),
    saAccessScopes,
    enableIntegrityMonitoring: parsers.boolean(enableIntegrityMonitoring),
    enableSecureBoot: parsers.boolean(enableSecureBoot),
    labels: parsers.tags(labels),
    gceInstanceMetadata: parsers.tags(gceInstanceMetadata),
    waitForOperation: parsers.boolean(waitForOperation),
  });
}

async function createNodePoolJson(action, settings) {
  const {
    zone, cluster, nodePoolJson, waitForOperation,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.createNodePoolJson({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
    nodePoolJson: parsers.objectOrFromPath(nodePoolJson),
    waitForOperation: parsers.boolean(waitForOperation),
  });
}

async function deleteCluster(action, settings) {
  const {
    zone, cluster, waitForOperation,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.deleteCluster({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
    waitForOperation: parsers.boolean(waitForOperation),
  });
}

async function deleteNodePool(action, settings) {
  const {
    zone, cluster, nodePool, waitForOperation,
  } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.deleteNodePool({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
    nodePool: parsers.autocomplete(nodePool),
    waitForOperation: parsers.boolean(waitForOperation),
  });
}

async function describeCluster(action, settings) {
  const { zone, cluster } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.describeCluster({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
  });
}

async function describeClusterCredentials(action, settings) {
  const { zone, cluster } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  const describedCluster = await client.describeCluster({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
  });
  return {
    certificateAuthority: describedCluster.masterAuth.clusterCaCertificate,
    endpoint: prependHttps(describedCluster.endpoint),
  };
}

async function listClusters(action, settings) {
  const { zone } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.listClusters({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
  });
}

async function listNodePools(action, settings) {
  const { zone, cluster } = action.params;
  const region = action.params.region || settings.region;
  const client = GKEService.from(action.params, settings);
  return client.listNodePools({
    region: parsers.autocomplete(region),
    zone: parsers.autocomplete(zone),
    cluster: parsers.autocomplete(cluster),
  });
}

async function createServiceAccount(action, settings) {
  const tokenKey = action.params.creds || settings.creds;
  const params = {
    zone: action.params.zone || settings.zone,
    project: (action.params.project || settings.project)?.value,
    namespace: action.params.namespace || settings.namespace,
    accountName: action.params.accountName || settings.accountName,
    roleBindingName: action.params.roleBindingName || settings.roleBindingName,
    clusterRole: action.params.clusterRole || settings.clusterRole,
  };

  let result = null;
  await temporaryFileSentinel(
    [tokenKey],
    async (keyFilePath) => {
      const tokenName = await gcloudCli.createServiceAccount({
        ...params, //TODO replace with concrete params
        keyFilePath,
      });

      const token = await gcloudCli.lookupToken({
        ...params,
        keyFilePath,
        tokenName,
      });

      const certificateAndEndpoint = await gcloudCli.lookupCertAndEndpoint({
        ...params,
        keyFilePath,
      });

      result = {
        serviceAccountNamespace: params.namespace,
        serviceAccountName: params.accountName,
        token,
        clusterEndpoint: certificateAndEndpoint.endpoint,
        clusterCertificate: certificateAndEndpoint.certificate,
      };
    },
  );

  return result;
}

module.exports = {
  createBasicCluster,
  createClusterJson,
  createNodePool,
  createNodePoolJson,
  deleteCluster,
  deleteNodePool,
  describeCluster,
  describeClusterCredentials,
  listClusters,
  listNodePools,
  createServiceAccount,
  // Autocomplete Functions
  ...autocomplete,
};
