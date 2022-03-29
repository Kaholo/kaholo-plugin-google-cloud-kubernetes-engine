const container = require("@google-cloud/container");
const { JWT } = require("google-auth-library");
const { google } = require("googleapis");
const { removeUndefinedAndEmpty, sleep, validateZoneParameter } = require("./helpers");
const parsers = require("./parsers");
const GCCEService = require("./gcce.service");

const containerApi = google.container("v1");

module.exports = class GKEService {
  constructor({ credentials, projectId }) {
    if (!credentials) {
      throw new Error("Credentials are required. Provide them either in the action's parameters or plugin's settings.");
    }
    if (typeof credentials !== "object") { throw new Error("Credentials provided in a bad format"); }
    this.options = { credentials };
    if (projectId) { this.options.projectId = projectId; }
    try {
      this.gcce = new GCCEService(credentials, projectId);
      this.gke = new container.v1.ClusterManagerClient(this.options);
    } catch (e) {
      throw new Error(`Couldn't connect to Google Cloud: ${e.message || e}`);
    }
  }

  static from(params, settings) {
    return new GKEService({
      credentials: parsers.jsonString(params.creds || settings.creds),
      projectId: parsers.autocomplete(params.project || settings.project),
    });
  }

  getAuthClient() {
    return new JWT(
      this.options.credentials.client_email,
      null,
      this.options.credentials.private_key,
      ["https://www.googleapis.com/auth/cloud-platform"],
    );
  }

  async createBasicCluster(params) {
    const {
      name: clusterName, locationType, region, zone,
      controlPlaneReleaseChannel, version, waitForOperation,
      ...restParams
    } = params;
    const isZonal = locationType === "Zonal";
    validateZoneParameter({ locationType, zone });
    return this.createClusterJson({
      clusterJson: removeUndefinedAndEmpty({
        name: clusterName,
        location: isZonal ? zone : region,
        ...(isZonal ? { locations: [zone] } : {}),
        releaseChannel: controlPlaneReleaseChannel === "none" ? undefined : {
          channel: controlPlaneReleaseChannel,
        },
        initialClusterVersion: version,
        nodePools: [GKEService.parseNodePool({
          nodePoolName: "default-pool",
          ...params,
        })],
        ...restParams,
      }),
      zone,
      region,
      locationType,
      waitForOperation,
    });
  }

  static parseNodePool({
    nodePoolName, numberOfNodes, enableAutoscaling, minNode, maxNode, maxSurge, maxUnavailable,
    machineType, customMachineCpuCount, customMachineMem, nodeImage, diskType, diskSize,
    diskEncryptionKey, preemptible, maxPodsPerNode, networkTags, serviceAccount,
    saAccessScopes, enableIntegrityMonitoring, enableSecureBoot,
    labels, gceInstanceMetadata, version,
  }) {
    let resolvedMachineType = machineType;
    if (customMachineCpuCount || customMachineMem) {
      resolvedMachineType += `-${customMachineCpuCount}-${customMachineMem}`;
    }
    return removeUndefinedAndEmpty({
      name: nodePoolName,
      initialNodeCount: numberOfNodes,
      autoscaling: enableAutoscaling ? {
        enabled: true,
        maxNodeCount: maxNode,
        minNodeCount: minNode,
      } : {},
      maxPodsConstraint: {
        maxPodsPerNode: String(maxPodsPerNode || 110),
      },
      upgradeSettings: { maxSurge, maxUnavailable },
      config: {
        diskSizeGb: diskSize,
        metadata: {
          ...(gceInstanceMetadata || {}),
          "disable-legacy-endpoints": "true",
        },
        imageType: nodeImage,
        tags: networkTags,
        bootDiskKmsKey: diskEncryptionKey,
        shieldedInstanceConfig: {
          enableSecureBoot,
          enableIntegrityMonitoring,
        },
        oauthScopes: saAccessScopes === "full" ? ["https://www.googleapis.com/auth/cloud-platform"]
          : [
            "https://www.googleapis.com/auth/devstorage.read_only",
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring",
            "https://www.googleapis.com/auth/servicecontrol",
            "https://www.googleapis.com/auth/service.management.readonly",
            "https://www.googleapis.com/auth/trace.append",
          ],
        management: {
          autoUpgrade: true,
          autoRepair: true,
        },
        serviceAccount,
        machineType: resolvedMachineType,
        labels,
        diskType,
        preemptible,
      },
      version,
    });
  }

  async createClusterJson({
    locationType, region, zone, clusterJson, waitForOperation,
  }) {
    validateZoneParameter({ locationType, zone });
    const isZonal = locationType === "Zonal";
    const [operation] = await this.gke.createCluster({
      parent: this.getLocationAsParent({
        region,
        ...(isZonal ? { zone } : {}),
      }),
      cluster: clusterJson,
      ...(isZonal ? { zone } : {}),
    });
    return waitForOperation ? this.waitForOperation({
      ...(isZonal ? { zone } : {}),
      region,
      operation,
    }) : operation;
  }

  async createNodePool(params) {
    const {
      cluster, region, zone, waitForOperation,
    } = params;
    return this.createNodePoolJson({
      cluster,
      region,
      zone,
      waitForOperation,
      nodePoolJson: GKEService.parseNodePool(params),
    });
  }

  async createNodePoolJson({
    region, zone, cluster, nodePoolJson, waitForOperation,
  }) {
    if (!cluster) {
      throw new Error("Must provide a cluster to create the node pool for.");
    }
    const parent = this.getClusterAsParent({ region, zone, cluster });
    const operation = (await this.gke.createNodePool({
      clusterId: cluster,
      nodePool: nodePoolJson,
      parent,
      zone,
    }))[0];
    return waitForOperation ? this.waitForOperation({ zone, region, operation }) : operation;
  }

  async deleteCluster({
    region, zone, cluster, waitForOperation,
  }) {
    if (!cluster) {
      throw new Error("Must provide a cluster to delete.");
    }
    const parent = this.getLocationAsParent({ region, zone });
    const operation = (await this.gke.deleteCluster({
      clusterId: cluster,
      projectId: this.options.projectId,
      parent,
      zone,
    }))[0];
    return waitForOperation ? this.waitForOperation({ zone, region, operation }) : operation;
  }

  async deleteNodePool({
    region, zone, cluster, nodePool, waitForOperation,
  }) {
    const parent = this.getClusterAsParent({ region, zone, cluster });
    const operation = (await this.gke.deleteNodePool({
      clusterId: cluster,
      nodePoolId: nodePool,
      projectId: this.options.projectId,
      parent,
      zone,
    }))[0];
    return waitForOperation ? this.waitForOperation({ zone, region, operation }) : operation;
  }

  async describeCluster({ region, zone, cluster }) {
    if (!cluster) {
      throw new Error("Must provide a cluster to describe.");
    }
    const parent = this.getClusterAsParent({ region, zone, cluster });
    return (await this.gke.getCluster({
      clusterId: cluster,
      projectId: this.options.projectId,
      parent,
      zone,
    }))[0];
  }

  getClusterAsParent({ region, zone, cluster: clusterId }) {
    return `${this.getLocationAsParent({ region, zone })}/clusters/${clusterId}`;
  }

  getLocationAsParent({ region, zone }) {
    return `projects/${this.options.projectId}/${zone ? "zones" : "locations"}/${zone || region}`;
  }

  async listClusters({ region, zone }) {
    const parent = this.getLocationAsParent({ region, zone });
    return (await this.gke.listClusters({ parent, zone }))[0].clusters;
  }

  async listNodePools({ region, zone, cluster }) {
    if (!cluster) {
      throw new Error("Must provide a cluster to list it's node pools.");
    }
    const parent = this.getClusterAsParent({ region, zone, cluster });
    return (await this.gke.listNodePools({ clusterId: cluster, parent, zone }))[0].nodePools;
  }

  async listProjects({ query }) {
    return this.gcce.listProjects({ query });
  }

  async listRegions(_, fields) {
    return this.gcce.listRegions({}, fields);
  }

  async listZones({ region }, fields) {
    return this.gcce.listZones({ region }, fields);
  }

  async listMachineTypes({ zone }, fields, pageToken) {
    let resolvedZone = zone;
    if (!resolvedZone) { resolvedZone = "us-central1-c"; }
    return this.gcce.listMachineTypes({ zone: resolvedZone }, fields, pageToken);
  }

  async listServiceAccounts() {
    return this.gcce.listServiceAccounts({});
  }

  listNetworks(...args) {
    return this.gcce.listNetworks(...args);
  }

  listSubnetworks(...args) {
    return this.gcce.listSubnetworks(...args);
  }

  async waitForOperation({ region, zone, operation }) {
    let resolvedOperation = operation;
    const params = {
      auth: this.getAuthClient(),
      projectId: this.options.projectId,
      name: `${this.getLocationAsParent({ region, zone })}/operations/${resolvedOperation.name}`,
      operationId: resolvedOperation.name,
    };
    // TODO: Remove awaits in loop
    while (resolvedOperation.status !== "DONE" && resolvedOperation.status !== "ABORTING") {
      try {
        let result;
        if (zone) {
          // eslint-disable-next-line
          result = await containerApi.projects.zones.operations.get({ ...params, zone });
        } else {
          // eslint-disable-next-line
          result = await containerApi.projects.locations.operations.get(params);
        }
        resolvedOperation = result.data;
      } catch (e) {
        throw new Error(`Couldn't get operation: ${e.message}\n${JSON.stringify(resolvedOperation)}`);
      }
      // eslint-disable-next-line
      await sleep(2000); // sleep for 2 seconds
    }
    if (resolvedOperation.status === "DONE" && !resolvedOperation.error) { return resolvedOperation; }
    throw resolvedOperation;
  }
};
