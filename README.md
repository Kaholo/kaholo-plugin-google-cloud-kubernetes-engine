# kaholo-plugin-google-cloud-kubernetes-engine
Kaholo plugin for integration with Google Cloud Kubernetes Engine(GKE).

##  Settings
1. Service Account Credentials (Vault) **Required if not in action** - Default service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Default Project ID (String) **Required if not in action** - The ID of the default project to send requests to.
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)

## Method: Create Basic Cluster
Create a new cluster with one node pool, only with most used options available.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Name (String) **Required** - Name of the new cluster
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
4. Location Type (Options) **Required** - Whether to create a regional or a zonal cluster.Possible values: **Zonal | Regional**
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
5. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
6. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
7. Control Plane Release Channel (Options) **Optional** - Choose a release channel for automatic management of your cluster's version and upgrade cadence. Choose a static version for more direct management of your cluster's version. Possible values: **None - Static | Rapid Channel | Regular Channel | Stable Channel**. Default Value is `None - Static`.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/release-channels)
8. Cluster Version (String) **Required** - The initial version of the cluster. Can be updated later if selecting a control plane release channel.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/release-notes)
9. Number Of Nodes (String) **Required** - Number of nodes to create in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
10. Enable Autoscaling (Boolean) **Optional** - Whether to enable autoscaling in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
11. Minimum Number Of Nodes (String) **Optional** - For Autoscaling. Minimum number of nodes in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
12. Maximum Number Of Nodes (String) **Optional** - For Autoscaling. Maximum number of nodes in the cluster's node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
13. Machine Type (Autocomplete) **Required** - The machine type for all nodes in pool. Every machine family has predefined machine shapes that have a specific vCPU to memory ratio that fits a variety of workload needs. If a predefined machine type does not meet your needs, you can create a custom machine for any general-purpose VM
[Learn More](https://cloud.google.com/compute/docs/machine-types)
14. Node Image Type (Autocomplete) **Required** - The type of node image to run on this nodes. Default is Container-optimized OS with Containerd(cos).
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images)
15. Boot Disk Type (Options) **Required** - Boot disk type for each node in pool.Possible values: **PD-Standard | PD-Balanced | PD-SSD**
[Learn More](https://cloud.google.com/compute/docs/disks)
16. Boot Disk Size(In GB) (String) **Required** - The size in GB for the boot disk of each node in the pool
[Learn More](https://cloud.google.com/compute/docs/disks)
17. Boot Disk Encryption Key (String) **Optional** - If specified, enable customer-managed encryption for boot the disk, and use the specified key to encrypt.
[Learn More](https://cloud.google.com/kms/docs/?hl=en_US)
18. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Create Cluster From JSON
Create a new cluster using the provided parameters JSON.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Location Type (Options) **Required** - Whether to create a regional or a zonal cluster.Possible values: **Zonal | Regional**
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
4. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
6. Cluster JSON (Text) **Required** - Create the cluster according to the parameters specified in the provided JSON. Can provide a local path to the file stored on the agent, or provide a JS object from code.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-zonal-cluster)
7. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Create Node Pool
Create a new node pool.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - The GKE cluster to create the node pool in.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
6. Cluster Version (String) **Required** - The initial version of the cluster. Can be updated later if selecting a control plane release channel.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/release-notes)
7. Pool Name (String) **Required** - Name of the node pool to create.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
8. Number Of Nodes (String) **Required** - Number of nodes to create in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
9. Enable Autoscaling (Boolean) **Optional** - Whether to enable autoscaling in this node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
10. Minimum Number Of Nodes (String) **Optional** - For Autoscaling. Minimum number of nodes in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
11. Maximum Number Of Nodes (String) **Optional** - For Autoscaling. Maximum number of nodes in the pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-autoscaler)
12. Max Surge (String) **Optional** - The number of additional nodes that can be added to the node pool during an upgrade. Default is 1. Can be set to 0 or greater.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-upgrades#surge)
13. Max Unavailable (String) **Optional** - The number of nodes that can be simultaneously unavailable during an upgrade. Default is 0.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-upgrades#surge)
14. Machine Type (Autocomplete) **Required** - The machine type for all nodes in pool. Every machine family has predefined machine shapes that have a specific vCPU to memory ratio that fits a variety of workload needs.
[Learn More](https://cloud.google.com/compute/docs/machine-types)
15. Custom Machine CPU Count (String) **Optional** - Required CPUs for the VM instance.
[Learn More](https://cloud.google.com/compute/docs/machine-types)
16. Custom Machine Memory(In MB) (String) **Optional** - When using custom nachine type, the size of the memory for the machine
[Learn More](https://cloud.google.com/compute/docs/instances/create-start-instance)
17. Node Image Type (Options) **Required** - The type of node image to run on this nodes. Default is Container-optimized OS with Containerd(cos).Possible values: **Container-Optimized OS with Containerd | Container-Optimized OS with Docker | Ubuntu with Docker | Ubuntu with Containerd | Windows Long Term Servicing Channel with Docker | Windows Long Term Servicing Channel with Containerd | Windows Semi-Annual Channel with Docker | Windows Semi-Annual Channel with Containerd**
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-images)
18. Boot Disk Type (Options) **Required** - Boot disk type for each node in pool.Possible values: **PD-Standard | PD-Balanced | PD-SSD**
[Learn More](https://cloud.google.com/compute/docs/disks)
19. Boot Disk Size(In GB) (String) **Required** - The size in GB for the boot disk of each node in the pool
[Learn More](https://cloud.google.com/compute/docs/disks)
20. Boot Disk Encryption Key (String) **Optional** - If specified, enable customer-managed encryption for the boot disk, and use the specified key for encryption. Please verify the service account has permission to encrypt/decrypt with the selected key before selecting one.
[Learn More](https://cloud.google.com/kms/docs/?hl=en_US)
21. Enable Preemptible Nodes (Boolean) **Optional** - Whether to enable preemptible nodes in this node pool. Preemptible nodes will live at most 24 hours.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/preemptible-vms)
22. Maximum Pods Per Node (String) **Optional** - This value is used to optimize the partitioning of cluster's IP address range to sub-ranges at node level. This setting is permanent. Defailt is 110. Value needs to be between 8 to 110.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/flexible-pod-cidr)
23. Network Tags (Text) **Optional** - Tags represent firewall rules applied to each node. Can specify multiple tags by seperating each with a new line or by prociding an array from code. Network Tags only has key and no value.
[Learn More](https://cloud.google.com/vpc/docs/firewalls)
24. API Access Service Account (Autocomplete) **Optional** - Provide access to an API access service account
[Learn More](https://cloud.google.com/iam/docs/service-accounts)
25. Service Account Access Scopes (Options) **Optional** - Which access rights to allow the service access accountPossible values: **Allow default access | Allow full access to all Cloud APIs**
[Learn More](https://cloud.google.com/compute/docs/access/create-enable-service-accounts-for-instances)
26. Enable Integrity Monitoring (Boolean) **Optional** - Integrity monitoring lets you monitor and verify the runtime boot integrity of your shielded nodes using Cloud Monitoring.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/how-to/shielded-gke-nodes)
27. Enable Secure Boot (Boolean) **Optional** - Secure boot helps protect your nodes against boot-level and kernel-level malware and rootkits.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)
28. Kubernetes Labels (Text) **Optional** - These labels are applied to every Kubernetes node in this node pool. Kubernetes node labels can be used in node selectors to control how workloads are scheduled to your nodes. Each label can either be specified in a key=value format, or only as key. Can enter multiple labels by seperating each label with a new line.
[Learn More](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
29. GCE Instance Metadata (Text) **Optional** - These items will appear in the Compute Engine instance metadata of every node in this node pool. Each item needs to be specified in a key=value format. Can enter multiple items by seperating each item with a new line.
[Learn More](https://cloud.google.com/compute/docs/metadata/overview)
30. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Create Node Pool From JSON
Create a new node pool in the specified cluster, using the provided parameters JSON.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - The GKE cluster to create the node pool in.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
6. Node Pool JSON (Text) **Required** - Create the node pool according to the parameters specified in the provided JSON. Can provide a local path to the file stored on the agent, or provide a JS object from code.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
7. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Delete Cluster
Delete the specified cluster.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - The GKE cluster to delete.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
6. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Delete Node Pool
Delete the specified node pool.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Optional** - The GKE cluster that stores the node pool.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
6. Node Pool (Autocomplete) **Optional** - The node pool to delete.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pools)
7. Wait For Operation End (Boolean) **Optional** - Waiting until the operation is completed before moving on to the next operation.
[Learn More](https://github.com/Kaholo/kaholo-plugin-google-cloud-kubernetes)

## Method: Describe Cluster
Describe the specified cluster.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - The GKE cluster to describe.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)

## Method: Describe Cluster Credentials
Similar to Describe Cluster but returns the client credential to use in the runtime with [kubernetes plugin](https://github.com/Kaholo/kaholo-plugin-kubernetes).

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)
3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - The GKE cluster to describe credentials.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)

## Method: List Clusters
List all clusters of the connected account.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)

## Method: List Node Pools
List all node pools of the specified cluster.

## Parameters
1. Service Account Credentials (Vault) **Required if not in settings** - Service account credentials
[Learn More](https://cloud.google.com/docs/authentication/production)
2. Project (Autocomplete) **Required if not in settings** - Project name
[Learn More](https://cloud.google.com/resource-manager/docs/creating-managing-projects)3. Region (Autocomplete) **Required** - Region name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
4. Zone (Autocomplete) **Required For Zonal Clusters** - Zone name
[Learn More](https://cloud.google.com/compute/docs/regions-zones)
5. Cluster (Autocomplete) **Required** - List node pools of the specified cluster.
[Learn More](https://cloud.google.com/kubernetes-engine/docs/concepts/cluster-architecture)
