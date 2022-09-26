# Kaholo Google Kubernetes Engine Plugin
This plugin extends Kaholo to be able <b>to create and configure</b> Kubernetes clusters in Google Kubernetes Engine (GKE). GKE provides a managed environment for deploying, managing, and scaling your containerized applications using Google infrastructure.

<b>If you already have a GKE cluster</b> to use, please use the [Kaholo Kubernetes Plugin](https://github.com/Kaholo/kaholo-plugin-kubernetes/releases) to deploy applications and services within the cluster. The Kaholo Kubernetes Plugin is a general Kubernetes plugin that works with Kuberenetes clusters of all types - Google, AWS, Azure, microk8s, minikube, etc.

## Zonal vs Regional Clusters
GKE provides two "location types" of clusters, zonal and regional. The main difference is zonal clusters exist within only one zone, while regional ones may have nodes spread across multiple zones, for fault tolerance and high availability purposes. When using the Kaholo Google Kubernetes Engine Plugin, both zone and region are often available as paramters, but if using a regional cluster, the zone parameter may be simply ignored, i.e. left empty.

## Prerequisites
To use this plugin you must first have a GCP Account credentials with sufficient privileges to create and manage the GKE service.

## Access and Authentication
GKE uses a set of Service Account Credentials (or Keys) for access and authentication. These are downloaded in JSON or P12 format when created. Kaholo uses the JSON format, and this is stored in the Kaholo Vault and configured in a Kaholo Account for use with this plugin as well as other GCP plugins such as the GCP CLI or GCP Cloud Storage plugins. The Kaholo Vault allows the credentials to be used without exposing them in log files, error messages, execution results, or screenshots.

When pasting your GCP service account credentials into the Kaholo Vault, be careful to avoid line break issues. These happen when you cut from some text editors that use word wrap and then paste into Kaholo - newline characters get introduced. To avoid this either disable word-wrap or use another product that takes word-wrap into account when cutting/copying. If you have this issue the error when running a gcloud command looks something like this:

    Error : Error: ERROR: (gcloud.auth.activate-service-account) Could not read json file /tmp/tmp.GLezAM1EsF.json: Invalid \escape: line 1 column 764 (char 763)

## Plugin Settings
GCP further organizes resources into named projects. The Project ID determines which assets you can see as well as various other project-level settings and permissions. Projects may also include assets in several geographical regions, but commonly a specific region is used for all assets in a Project.

Both Project ID and Region are configurable in Plugin Settings. This is for convenience only - once configured here any new GKE Actions in Kaholo pipelines will be given the values configured in Plugin Settings by default. If the defaults are not correct they can then be removed or corrected at the Action level. If no defaults are configured in Plugin Settings, then every new GKE action will have empty Project ID and Region parameters that must then be manually filled in.

## Method: Create Basic Cluster
Create a new cluster with one node pool, configuring with only the most commonly used options.

### Parameters
* Project ID - The ID string of the GCP Project where the cluster should be created
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Name - Name of the new cluster
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
* Location Type - Whether to create a regional or a zonal cluster.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
* Region - the geographical region where the cluster will be created.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the cluster is to be a Zonal type cluster.
* Control Plane Release Channel - Determines the version and upgrade frequency of the cluster's Kubernetes implementation.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/release-channels)
* Cluster Version - The initial version of the cluster.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/release-notes)
* Number Of Nodes - Number of nodes to create in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
* Enable Autoscaling - Whether to enable autoscaling for the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Minimum Number Of Nodes - If Autoscaling, the minimum number of nodes in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Maximum Number Of Nodes - If Autoscaling, the maximum number of nodes in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Machine Type - The machine type for nodes in the cluster's node pool. Determines how much compute and memory resources are available for each node.
[Learn More](https://cloud.google.com/compute/docs/machine-types)
* Node Image Type - The type of node image to run on this nodes. Determines OS and container type for nodes.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images)
* Boot Disk Type - Boot disk type for nodes, affects disk I/O performance.
[Learn More](https://cloud.google.com/compute/docs/disks)
* Boot Disk Size(In GB) - The size in GB of disk space available for each node
[Learn More](https://cloud.google.com/compute/docs/disks)
* Boot Disk Encryption Key - If specified, enables customer-managed encryption for node's disks.
[Learn More](https://cloud.google.com/kms/docs/?hl=en_US)
* Wait For Operation End - Waits until the cluster is up and running before moving on to the next operation in the pipeline. Also provides more complete information regarding the cluster in Kaholo's Final Result.

## Method: Create Cluster From JSON
Create a new cluster using parameters described in a JSON file of [appropriate schema](https://cloud.google.com/kubernetes-engine/docs/reference/rest/v1/projects.zones.clusters). See the example toward the end of this document.

### Parameters
* Project ID - The ID string of the GCP Project where the cluster should be created
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Location Type - Whether to create a regional or a zonal cluster.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
* Region - the geographical region where the cluster will be created.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the cluster is to be a Zonal type cluster.
* Cluster JSON - a JSON object, string, or text describing the details of the cluster to create.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
* Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Create Node Pool
Create a new node pool, defining each of the configurable parameters.

### Parameters
* Project ID - The ID string of the GCP Project where the node pool should be created
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the node pool will be created.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the associated cluster is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster to which the new node pool will be added.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
* Cluster Version - The initial version of the cluster, or empty for the current version.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/release-notes)
* Pool Name - Name for the node pool being created.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
* Number Of Nodes - Number of nodes to create in the new node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
* Enable Autoscaling - Whether to enable autoscaling in this node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Minimum Number Of Nodes - If Autoscaling, the minimum number of nodes in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Maximum Number Of Nodes - If Autoscaling, the maximum number of nodes in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
* Max Surge - The number of additional nodes that can be added to the node pool during an upgrade. Default is 1. Can be set to 0 or greater.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-upgrades#surge)
* Max Unavailable - The number of nodes that can be simultaneously unavailable during an upgrade. Default is 0.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-upgrades#surge)
* Machine Type - The machine type for nodes in the cluster's node pool. Determines how much compute and memory resources are available for each node.
[Learn More](https://cloud.google.com/compute/docs/machine-types)
* Custom Machine CPU Count - For customer machine tyeps, a specific number of vCPU for each node.
[Learn More](https://cloud.google.com/compute/docs/machine-types)
* Custom Machine Memory (MB) - For customer machine tyeps, the size of the memory for each node.
[Learn More](https://cloud.google.com/compute/docs/instances/create-start-instance)
* Node Image Type - The type of node image to run on this nodes. Determines OS and container type for nodes.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images)
* Boot Disk Type - Boot disk type for nodes, affects disk I/O performance.
[Learn More](https://cloud.google.com/compute/docs/disks)
* Boot Disk Size(In GB) - The size in GB of disk space available for each node
[Learn More](https://cloud.google.com/compute/docs/disks)
* Boot Disk Encryption Key - If specified, enables customer-managed encryption for node's disks.
[Learn More](https://cloud.google.com/kms/docs/?hl=en_US)
* Enable Preemptible Nodes - Whether to enable preemptible nodes in this node pool. Preemptible nodes will live at most 24 hours.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/preemptible-vms)
* Maximum Pods Per Node - This value is used to optimize the partitioning of cluster's IP address range to sub-ranges at node level. Default is 110 but smaller values may be configured.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr)
* Network Tags - Tags correspond to firewall rules applied to each node. Can specify multiple tags by seperating each with a new line or by providing an array from code.
[Learn More](https://cloud.google.com/vpc/docs/firewalls)
* API Access Service Account - if configured, provide access to a specific API access service account
[Learn More](https://cloud.google.com/iam/docs/service-accounts)
* Service Account Access Scopes - Which access rights to allow the service access account. Possible values: **Allow default access | Allow full access to all Cloud APIs**
[Learn More](https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances)
* Enable Integrity Monitoring - Integrity monitoring lets you monitor and verify the runtime boot integrity of your shielded nodes using Cloud Monitoring.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/shielded-gke-nodes)
* Enable Secure Boot - Secure boot helps protect your nodes against boot-level and kernel-level malware and rootkits.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)
* Kubernetes Labels - These labels are applied to every Kubernetes node in this node pool. Kubernetes node labels can be used in node selectors to control how workloads are scheduled to your nodes. Each label can either be specified in a key=value format, or only as key. Can enter multiple labels by seperating each label with a new line.
[Learn More](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
* GCE Instance Metadata - These items will appear in the Compute Engine instance metadata of every node in this node pool. Each item needs to be specified in a key=value format. Can enter multiple items by seperating each item with a new line.
[Learn More](https://cloud.google.com/compute/docs/metadata/overview)
* Wait For Operation End - Wait until the node pool is up and running before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Create Node Pool From JSON
Create a new node pool in the specified cluster, using the parameters provided in JSON text or object format.

### Parameters
* Project ID - The ID string of the GCP Project where the node pool should be created
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the node pool will be created.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the associated cluster is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster to which the new node pool will be added.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
* Cluster JSON - a JSON object, string, or text describing the details of the node pool to create.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
* Wait For Operation End - Wait until the node pool is up and running before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Delete Cluster
Delete the specified cluster.

### Parameters
* Project ID - The ID string of the GCP Project where a cluster will be deleted.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the cluster will be deleted.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the associated cluster to be deleted is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster to be deleted.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
* Wait For Operation End - Wait until the Action is completed before moving on to the next Action in the pipeline.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Delete Node Pool
Delete the specified node pool.

### Parameters
* Project ID - The ID string of the GCP Project where a node pool will be deleted.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the node pool will be deleted.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the associated node pool to be deleted belongs to a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster containing the node pool to be deleted.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
* Node Pool - The node pool to delete.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
* Wait For Operation End - Wait until the Action is completed before moving on to the next Action in the pipeline.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Describe Cluster
Describe the specified cluster.

### Parameters
* Project ID - The ID string of the GCP Project of the cluster.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the cluster is located.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the cluster is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster to be described.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)

## Method: Describe Cluster Credentials
Returns the cluster's CA Certificate and endpoint, but not a token able to access the cluster. See method "Create Service Account" to be able to access the cluster using the [Kaholo Kubernetes Plugin](https://github.com/Kaholo/kaholo-plugin-kubernetes/releases).
[kubernetes plugin](https://github.com/Kaholo/kaholo-plugin-kubernetes).

### Parameters
* Project ID - The ID string of the GCP Project of the cluster.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the cluster is located.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the cluster is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster to describe.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)

## Method: List Clusters
List all clusters of in a specific project and region/zone. If listing a region without zone, only regional clusters will be listed. If listing a specific zone, only zonal clusters located there will be listed.

### Parameters
* Project ID - The ID string of the GCP Project of the cluster.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the clusters will be listed.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region for listing Zonal type clusters.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)

## Method: List Node Pools
List all node pools of the specified cluster.

### Parameters
* Project ID - The ID string of the GCP Project of the cluster.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Region - the geographical region where the cluster is located.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Zone - the zone within the region if the cluster is a Zonal type cluster.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Cluster - The GKE cluster who's node pools will be listed.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)

## Method: Create Service Account
The default service account with a new cluster is a GCP-authenticated one not well suited for pipeline automation. This method creates a normal Kubernetes service account and returns CA Certificate, endpoint and a JWT token. This can then be used for example with the [Kaholo Kubernetes Plugin](https://github.com/Kaholo/kaholo-plugin-kubernetes/releases).

Note: The token is returned in the Final Result of the action. It must then be manually copied and pasted into a Kaholo Vault item for further use. This is somewhat of a security risk because any user who can view the Kaholo Execution results can obtain the token. For better security consider using a [standard GCP procedure](https://cloud.google.com/kubernetes-engine/docs/how-to/kubernetes-service-accounts) to create a service account.

### Parameters
* Zone/Region - the geographical zone or region where the cluster is located.
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
* Project ID - The ID string of the GCP Project of the cluster.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
* Namespace - A namespace to which the service account will be confined, or if blank or "default" the service account will not be confined to any namespace. This also determines if the account will be given a role or a cluster role.
* Service Account Name - an arbitrary name for the service account.
* Role Binding Name - an arbitrary name for the role binding of the service account.
* Cluster Role Name - any predefined cluster role name to bind with the service account, e.g. "cluster-admin". This parameter is the role name if non-default namespace is specified.
[Learn More](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)

## Example Cluster JSON
This is an example JSON file of the type used to create a GKE cluster from JSON

    {
        "name": "example-cluster",
        "masterAuth": {
            "clientCertificateConfig": {}
        },
        "network": "projects/plugins-helm-alpha/global/networks/example-net",
        "addonsConfig": {
            "httpLoadBalancing": {},
            "horizontalPodAutoscaling": {},
            "kubernetesDashboard": {
                "disabled": true
            },
            "dnsCacheConfig": {},
            "gcePersistentDiskCsiDriverConfig": {
                "enabled": true
            }
        },
        "subnetwork": "projects/plugins-helm-alpha/regions/us-east5/subnetworks/example-dmz",
        "nodePools": [
            {
                "name": "example-pool",
                "config": {
                    "machineType": "e2-highcpu-4",
                    "diskSizeGb": 50,
                    "oauthScopes": [
                        "https://www.googleapis.com/auth/devstorage.read_only",
                        "https://www.googleapis.com/auth/logging.write",
                        "https://www.googleapis.com/auth/monitoring",
                        "https://www.googleapis.com/auth/servicecontrol",
                        "https://www.googleapis.com/auth/service.management.readonly",
                        "https://www.googleapis.com/auth/trace.append"
                    ],
                    "metadata": {
                        "disable-legacy-endpoints": "true"
                    },
                    "imageType": "COS_CONTAINERD",
                    "diskType": "pd-standard",
                    "shieldedInstanceConfig": {
                        "enableIntegrityMonitoring": true
                    }
                },
                "initialNodeCount": 1,
                "autoscaling": {
                    "enabled": true,
                    "minNodeCount": 1,
                    "maxNodeCount": 3
                },
                "management": {
                    "autoUpgrade": true,
                    "autoRepair": true
                },
                "maxPodsConstraint": {
                    "maxPodsPerNode": "110"
                },
                "networkConfig": {},
                "upgradeSettings": {
                    "maxSurge": 1
                }
            }
        ],
        "locations": [
            "us-east5-b"
        ],
        "networkPolicy": {},
        "ipAllocationPolicy": {
            "useIpAliases": true
        },
        "masterAuthorizedNetworksConfig": {},
        "autoscaling": {},
        "networkConfig": {
            "datapathProvider": "LEGACY_DATAPATH"
        },
        "defaultMaxPodsConstraint": {
            "maxPodsPerNode": "110"
        },
        "authenticatorGroupsConfig": {},
        "databaseEncryption": {
            "state": "DECRYPTED"
        },
        "shieldedNodes": {
            "enabled": true
        },
        "releaseChannel": {
            "channel": "REGULAR"
        },
        "notificationConfig": {
            "pubsub": {}
        },
        "initialClusterVersion": "",
        "initialClusterVorsion": "1.21.6-gke.1500",
        "location": "us-east5-b",
        "loggingConfig": {
            "componentConfig": {
                "enableComponents": [
                    "SYSTEM_COMPONENTS",
                    "WORKLOADS"
                ]
            }
        },
        "monitoringConfig": {
            "componentConfig": {
                "enableComponents": [
                    "SYSTEM_COMPONENTS"
                ]
            }
        }
    }