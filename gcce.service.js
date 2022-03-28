const Compute = require("@google-cloud/compute");
const { JWT } = require("google-auth-library");
const { google } = require("googleapis");

const cloudresourcemanager = google.cloudresourcemanager("v1");
const compute = google.compute("v1");
const iam = google.iam("v1");
const {
  defaultGcpCallback, removeUndefinedAndEmpty, handleOperation, parseFields,
} = require("./helpers");
const parsers = require("./parsers");

/** Class for using the google cloud compute API(by extending it's npm packge). */
module.exports = class GoogleComputeService extends Compute {
  /**
     * Create a Google Cloud Compute service instance
     * @param {object} credentials The credentials of a service account to use to make the request
     * @param {string} projectId The ID of the project to make all the requests about.
     */
  constructor(credentials, projectId) {
    const computeOptions = { credentials };
    if (projectId) { computeOptions.projectId = projectId; }
    super(computeOptions);

    this.projectId = projectId;
    this.creds = credentials;
  }

  /**
     * Get Google Compute Service Client from Kaholo action and settings objects
     * @param {object} params Kaholo Action Params Object
     * @param {string} settings Kaholo Settings Object
     * @return {GoogleComputeService} The Google Compute Service Client
     */
  static from(params, settings, noProject) {
    const creds = parsers.object(params.creds || settings.creds);
    if (!creds) { throw new Error("Must provide credentials to call any method in the plugin!"); }
    const args = [creds];
    if (!noProject) {
      args.push(parsers.autocomplete(params.project || settings.project));
    }
    return new GoogleComputeService(...args);
  }

  getAuthClient() {
    return new JWT(
      this.creds.client_email,
      null,
      this.creds.private_key,
      ["https://www.googleapis.com/auth/cloud-platform"],
    );
  }

  /**
     * Create an external IP address for the specified instance
     * @param {string} regionStr The region of the instance
     * @param {string} instanceName The name\id of the instance to create the external IP for
     * @return {Promise<string>} The external address created for the instance
     */
  async autoCreateExtIp(regionStr, instanceName) {
    const addrName = `${instanceName}-ext-addr`;
    try {
      const region = this.region(regionStr);
      const [address, operation] = (await region.createAddress(addrName, { addressType: "EXTERNAL" }));
      await handleOperation(operation);
      const extIpAddr = (await address.getMetadata())[0].address;
      return extIpAddr;
    } catch (err) {
      throw new Error(`Couldn't create external address with the name: ${addrName}\n${err.message || JSON.stringify(err)}`);
    }
  }

  async deleteAutoExtIp(regionStr, instanceName) {
    const addrName = `${instanceName}-ext-addr`;
    const request = removeUndefinedAndEmpty({
      project: this.projectId,
      region: regionStr,
      address: addrName,
      auth: this.getAuthClient(),
    });
    return compute.addresses.delete(request);
  }

  /**
   * Create a new VM instance in the specified zone
   * @param {object} options Launch options for the instance
   * @param {boolean} waitForOperation Whether to wait for the operation to finish before returning
   * @return {object} The VM instance created, and metadata about it
   */
  async launchVm({
    name, description, region, zone, machineType, sourceImage, diskType, diskSizeGb, diskAutoDelete,
    serviceAccount, saAccessScopes, allowHttp, allowHttps, network, subnetwork, networkIP,
    networkInterfaces, canIpForward, preemptible, tags, labels, autoCreateStaticIP,
  }, waitForOperation) {
    let resolvedZone = zone;
    const resolvedTags = tags || [];
    if (allowHttp) { resolvedTags.push("http-server"); }
    if (allowHttps) { resolvedTags.push("https-server"); }
    const scopes = (
      saAccessScopes === "full"
        ? ["https://www.googleapis.com/auth/cloud-platform"]
        : saAccessScopes
    );
    const config = removeUndefinedAndEmpty({
      machineType: machineType ? `projects/${this.projectId}/zones/${resolvedZone}/machineTypes/${machineType}` : undefined,
      canIpForward,
      labels,
      description,
      scheduling: {
        automaticRestart: !preemptible,
        onHostMaintenance: preemptible ? "TERMINATE" : "MIGRATE",
        preemptible: preemptible || false,
      },
      networkInterfaces: (
        network && subnetwork ? [{ network, subnetwork, networkIP }] : []
      ).concat(networkInterfaces || []),
      tags: resolvedTags.length > 0 ? { items: resolvedTags } : undefined,
      disks: [{
        boot: true,
        initializeParams: {
          sourceImage,
          diskType: diskType ? `zones/${resolvedZone}/diskTypes/${diskType}` : undefined,
          diskSizeGb,
        },
        autoDelete: diskAutoDelete || false,
        mode: "READ_WRITE",
        type: "PERSISTENT",
      }],
      serviceAccounts: serviceAccount ? [{
        email: serviceAccount,
        scopes: saAccessScopes === "default" ? [
          "https://www.googleapis.com/auth/devstorage.read_only",
          "https://www.googleapis.com/auth/logging.write",
          "https://www.googleapis.com/auth/monitoring.write",
          "https://www.googleapis.com/auth/servicecontrol",
          "https://www.googleapis.com/auth/service.management.readonly",
          "https://www.googleapis.com/auth/trace.append"]
          : scopes,
      }] : undefined,
    });

    if (autoCreateStaticIP) {
      const natIP = await this.autoCreateExtIp(region, name);
      if (!config.networkInterfaces) {
        config.networkInterfaces = [{ accessConfigs: [{ natIP }] }];
      } else if (!config.networkInterfaces[0].accessConfigs) {
        config.networkInterfaces[0].accessConfigs = [{ natIP }];
      } else {
        config.networkInterfaces[0].accessConfigs[0].natIP = natIP;
      }
    }

    resolvedZone = this.zone(resolvedZone);
    return new Promise((resolve, reject) => {
      const vmReject = !autoCreateStaticIP ? reject : (
        (err) => this.deleteAutoExtIp(region, name).finally(() => reject(err))
      );
      resolvedZone.createVM(name, config, defaultGcpCallback(resolve, vmReject, waitForOperation));
    });
  }

  /**
   * Execute some action on the specified instance, possible actions include:
   * Start | Stop | Delete | Restart | Get | Get-IP(Get external IP)
   * @param {object} options Options for running the action.
   * @param {string} options.zoneStr The name of the zone of the vm instance
   * @param {string} options.vmName The name\id of the vm instance
   * @param {string} options.action The type of action to run on the instance. Can be:
   * Start | Stop | Delete | Restart | Get | Get-IP(Get external IP)
   * @param {boolean} waitForOperation whether to wait for the operation to finish before returning
   * @return {object} The vm instance the action was performed on, and it's metadata
   */
  async vmAction({ zoneStr, vmName, action }, waitForOperation) {
    const zone = this.zone(zoneStr);
    const vm = zone.vm(vmName);
    let res = {};
    switch (action) {
      case "Stop":
        res = await vm.stop();
        break;
      case "Delete":
        res = await vm.stop();
        res = await vm.delete();
        break;
      case "Restart":
        res = await vm.reset();
        break;
      case "Start":
        res = await vm.start();
        break;
      case "Get":
        return vm;
      case "Get-IP": {
        const [metadata] = await vm.getMetadata();
        if (!metadata.networkInterfaces || !metadata.networkInterfaces[0].accessConfigs
                    || !metadata.networkInterfaces[0].accessConfigs[0].natIP) {
          throw new Error("No external IP found");
        }
        return metadata.networkInterfaces[0].accessConfigs[0].natIP;
      }
      default:
        throw new Error("Must provide an action to run on the VM instance!");
    }
    if (waitForOperation) { await handleOperation(res[0]); }
    return res[1] || res;
  }

  // doesn't work with self methods so using the second compute api
  async createVpc({ name, description, autoCreateSubnetworks }, waitForOperation) {
    const auth = this.getAuthClient();
    const request = removeUndefinedAndEmpty({
      project: this.projectId,
      resource: {
        name,
        autoCreateSubnetworks,
        description,
      },
      auth,
    });
    let result = (await compute.networks.insert(request)).data;
    if (!waitForOperation) { return result; }
    if (result.error) { throw result; }
    result = (await compute.globalOperations.wait({
      project: this.projectId,
      operation: result.name,
      auth,
    })).data;
    if (result.error) { throw result; }
    return result;
  }

  async createSubnet({
    networkId, name, description, region, range, privateIpGoogleAccess,
    enableFlowLogs,
  }, waitForOperation) {
    const network = this.network(networkId);
    const config = removeUndefinedAndEmpty({
      region, range, description, enableFlowLogs, privateIpGoogleAccess,
    });
    return new Promise((resolve, reject) => {
      network.createSubnetwork(name, config, defaultGcpCallback(resolve, reject, waitForOperation));
    });
  }

  async reserveIp({
    subnet, name, regionStr, address,
  }, waitForOperation) {
    const region = this.region(regionStr);
    const config = removeUndefinedAndEmpty({
      subnetwork: `regions/${regionStr}/subnetworks/${subnet}`,
      addressType: "INTERNAL",
      address,
    });
    return new Promise((resolve, reject) => {
      region.createAddress(name, config, defaultGcpCallback(resolve, reject, waitForOperation));
    });
  }

  async createFw({
    networkId, name, priority, direction, action, ipRange, protocol,
    ports,
  }, waitForOperation) {
    const firewall = this.firewall(name);
    const fwRule = [{
      IPProtocol: protocol || "all",
      ports,
    }];
    const config = removeUndefinedAndEmpty({
      network: `projects/${this.projectId}/global/networks/${networkId || "default"}`,
      destinationRanges: [],
      sourceRanges: [],
      priority: priority || 1000,
      direction: direction || "INGRESS",
    });
    if (fwRule) { config[!action || action === "allow" ? "allowed" : "denied"] = fwRule; }
    if (ipRange) { config[config.direction === "INGRESS" ? "sourceRanges" : "destinationRanges"] = ipRange; }
    return new Promise((resolve, reject) => {
      firewall.create(config, defaultGcpCallback(resolve, reject, waitForOperation));
    });
  }

  async createRoute({
    networkId, name, nextHopIp, destRange, priority, tags,
  }) {
    const request = removeUndefinedAndEmpty({
      project: this.projectId,
      resource: {
        name,
        nextHopIp,
        destRange,
        tags,
        network: `projects/${this.projectId}/global/networks/${networkId}`,
        priority: priority || "0",
      },
      auth: this.getAuthClient(),
    });
    return (await compute.routes.insert(request)).data;
  }

  async listProjects({ query }) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      filter: query ? `name:*${query}* id:*${query}*` : undefined,
    });
    return (await cloudresourcemanager.projects.list(request)).data.projects;
  }

  async listRegions(_, fields) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      maxResults: 500,
      project: this.projectId,
      fields: parseFields(fields),
    });
    return (await compute.regions.list(request)).data;
  }

  async listZones({ region }, fields) {
    if (fields && !fields.includes("name")) { fields.push("name"); }
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      maxResults: 500,
      project: this.projectId,
      fields: parseFields(fields),
    });
    const { items } = (await compute.zones.list(request)).data;
    return items.filter((zone) => !region || zone.name.includes(region));
  }

  async listMachineTypes({ zone }, fields, pageToken) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      project: this.projectId,
      fields: parseFields(fields),
      zone,
      pageToken,
    });

    return (await compute.machineTypes.list(request)).data;
  }

  async listImageProjects({ query: userProjectQuery }, fields) {
    const userProjects = await this.listProjects({ userProjectQuery }, fields);
    return [...userProjects,
      { name: "Debian Cloud", projectId: "debian-cloud" },
      { name: "Windows Cloud", projectId: "windows-cloud" },
      { name: "Ubuntu Cloud", projectId: "ubuntu-os-cloud" },
      { name: "Ubuntu Pro Cloud", projectId: "ubuntu-os-pro-cloud" },
      { name: "Google UEFI(CentOS|COS) Images", projectId: "gce-uefi-images" },
      { name: "Machine Learning Images", projectId: "ml-images" },
      { name: "Fedora CoreOS Cloud", projectId: "fedora-coreos-cloud" },
      { name: "Windows SQL Cloud", projectId: "windows-sql-cloud" },
      { name: "Windows Cloud", projectId: "windows-cloud" },
      { name: "Red Hat Enterprise Linux SAP Cloud", projectId: "rhel-sap-cloud" },
      { name: "SUSE Cloud", projectId: "suse-cloud" },
      { name: "Rocky Linux Cloud", projectId: "rocky-linux-cloud" },
    ];
  }

  async listImages({ zone, imageProject }, fields, pageToken) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      project: imageProject || this.projectId,
      fields: parseFields(fields),
      maxResults: 500,
      zone,
      pageToken,
    });
    return (await compute.images.list(request)).data;
  }

  async listServiceAccounts() {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      name: `projects/${this.projectId}`,
    });

    return (await iam.projects.serviceAccounts.list(request)).data.accounts;
  }

  async listNetworks({ query }, fields, pageToken) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      project: this.projectId,
      fields: parseFields(fields),
      filter: query ? `name:${query}` : undefined,
      maxResults: 500,
      pageToken,
    });

    const { data } = await compute.networks.list(request);
    return Object.keys(data).length === 0 ? { items: [] } : data;
  }

  async listSubnetworks({ network, region }, fields, pageToken) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      project: this.projectId,
      filter: network ? `network=${network}` : undefined,
      fields: parseFields(fields),
      maxResults: 500,
      region,
      pageToken,
    });

    const { data } = await compute.subnetworks.list(request);
    return Object.keys(data).length === 0 ? { items: [] } : data;
  }

  async listVms({ zone }, fields, pageToken) {
    const request = removeUndefinedAndEmpty({
      auth: this.getAuthClient(),
      project: this.projectId,
      fields: parseFields(fields),
      maxResults: 500,
      zone,
      pageToken,
    });

    return (await compute.instances.list(request)).data;
  }

  async waitForOperation({ operation }) {
    return (await compute.globalOperations.wait({
      auth: this.getAuthClient(),
      project: this.projectId,
      operation,
    })).data;
  }
};
