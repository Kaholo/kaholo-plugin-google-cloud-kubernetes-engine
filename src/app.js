const parsers = require("./parsers");

const GKEService = require('./gke.service');

async function createBasicCluster(action, settings){
    const { name, locationType, region, zone, controlPlaneReleaseChannel, version, numberOfNodes, enableAutoscaling, minNode, maxNode, machineType, nodeImage, diskType, diskSize, diskEncryptionKey, waitForOperation } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.createBasicCluster({
        name: parsers.string(name),
        locationType: locationType,
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        controlPlaneReleaseChannel: controlPlaneReleaseChannel,
        version: parsers.string(version),
        numberOfNodes: parsers.number(numberOfNodes),
        enableAutoscaling: parsers.boolean(enableAutoscaling),
        minNode: parsers.number(minNode),
        maxNode: parsers.number(maxNode),
        machineType: parsers.autocomplete(machineType),
        nodeImage: parsers.autocomplete(nodeImage),
        diskType: diskType,
        diskSize: parsers.number(diskSize),
        diskEncryptionKey: parsers.string(diskEncryptionKey),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function createClusterJson(action, settings){
    const { locationType, region, zone, clusterJson, waitForOperation } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.createClusterJson({
        locationType: locationType,
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        clusterJson: parsers.objectOrFromPath(clusterJson),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function createNodePool(action, settings){
    const { region, zone, cluster, name, numberOfNodes, enableAutoscaling, minNode, maxNode, maxSurge, maxUnavailable, machineType, customMachineCpuCount, customMachineMem, nodeImage, diskType, diskSize,
        diskEncryptionKey, preemptible, maxPodsPerNode, networkTags, serviceAccount, saAccessScopes, enableIntegrityMonitoring,
        enableSecureBoot, labels, gceInstanceMetadata, version , waitForOperation} = action.params;
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
        diskType: diskType,
        diskSize: parsers.number(diskSize),
        diskEncryptionKey: parsers.string(diskEncryptionKey),
        preemptible: parsers.boolean(preemptible),
        maxPodsPerNode: parsers.number(maxPodsPerNode),
        networkTags: parsers.array(networkTags),
        serviceAccount: parsers.autocomplete(serviceAccount),
        saAccessScopes: saAccessScopes,
        enableIntegrityMonitoring: parsers.boolean(enableIntegrityMonitoring),
        enableSecureBoot: parsers.boolean(enableSecureBoot),
        labels: parsers.tags(labels),
        gceInstanceMetadata: parsers.tags(gceInstanceMetadata),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function createNodePoolJson(action, settings){
    const { region, zone, cluster, nodePoolJson, waitForOperation } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.createNodePoolJson({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster),
        nodePoolJson: parsers.objectOrFromPath(nodePoolJson),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function deleteCluster(action, settings){
    const { region, zone, cluster, waitForOperation } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.deleteCluster({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function deleteNodePool(action, settings){
    const { region, zone, cluster, nodePool, waitForOperation } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.deleteNodePool({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster),
        nodePool: parsers.autocomplete(nodePool),
        waitForOperation: parsers.boolean(waitForOperation)
    });
}

async function describeCluster(action, settings){
    const { region, zone, cluster } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.describeCluster({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster)
    });
}

async function listClusters(action, settings){
    const { region, zone } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.listClusters({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone)
    });
}

async function listNodePools(action, settings){
    const { region, zone, cluster } = action.params;
    const client = GKEService.from(action.params, settings);
    return client.listNodePools({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster)
    });
}

async function describeClusterCredentials(action, settings){
    const { region, zone, cluster } = action.params;
    const client = GKEService.from(action.params, settings);
    var describedCluster = await client.describeCluster({
        region: parsers.autocomplete(region),
        zone: parsers.autocomplete(zone),
        cluster: parsers.autocomplete(cluster)
    });

    return clusterCredentials = {
        certificateAuthority: describedCluster.masterAuth.clusterCaCertificate,
        endpoint: describedCluster.endpoint,
        accessToken: await client.gke.auth.getAccessToken()
    }
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
    // Autocomplete Functions
    ...require("./autocomplete")
}
