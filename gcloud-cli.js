const {
  docker,
  helpers: {
    generateRandomEnvironmentVariableName,
  },
} = require("@kaholo/plugin-library");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const { splitDirectory } = require("./helpers");

const GCLOUD_DOCKER_IMAGE = "google/cloud-sdk:alpine";

async function createServiceAccount(params) {
  return callCommand(
    params,
    (stdout) => extractSecret(stdout),
    (
      environmentalVariablesNames,
      keyPathVolumeDefinition,
      keyFileName,
    ) => {
      const {
        zone: zoneVarName,
        project: projectVarName,
        name: nameVarName,
        namespace: namespaceVarName,
        serviceAccountName: serviceAccountNameVarName,
        roleBindingName: roleBindingNameVarName,
        clusterRoleName: clusterRoleNameVarName,
      } = environmentalVariablesNames;

      // const accountCreationCommand = namespaceVarName
      const accountCreationCommand = (params.namespace !== "default")
        ? `\
kubectl create namespace $${namespaceVarName} ; \
kubectl create serviceaccount $${serviceAccountNameVarName} --namespace $${namespaceVarName} ; \
kubectl create rolebinding $${roleBindingNameVarName} --clusterrole=$${clusterRoleNameVarName} \
--serviceaccount=$${namespaceVarName}:$${serviceAccountNameVarName} --namespace=$${namespaceVarName}`
        : `\
kubectl create serviceaccount $${serviceAccountNameVarName} ; \
kubectl create clusterrolebinding $${roleBindingNameVarName} --clusterrole=$${clusterRoleNameVarName} --serviceaccount=default:$${serviceAccountNameVarName}`;

      return `\
sh -c "\
gcloud components install kubectl --quiet && \
gcloud components install gke-gcloud-auth-plugin --quiet && \
gcloud auth activate-service-account --key-file=$${keyPathVolumeDefinition.mountPoint.name}/${keyFileName} && \
gcloud container clusters get-credentials $${nameVarName} --zone=$${zoneVarName} --project=$${projectVarName} && \
${accountCreationCommand} ; \
kubectl config set-context --current --namespace=$${namespaceVarName} ; \
kubectl describe serviceaccount $${serviceAccountNameVarName}
"`; // kubectl commands may fail if the object exists, that's why we execute no matter what
    },
  );
}

async function lookupToken(params) {
  return callCommand(
    params,
    (stdout) => extractTagValue(stdout, "token:"),
    (
      environmentalVariablesNames,
      keyPathVolumeDefinition,
      keyFileName,
    ) => {
      const {
        zone: zoneVarName,
        project: projectVarName,
        name: nameVarName,
        namespace: namespaceVarName,
        tokenName: tokenNameVarName,
      } = environmentalVariablesNames;

      return `\
sh -c "\
gcloud components install kubectl --quiet && \
gcloud components install gke-gcloud-auth-plugin --quiet && \
gcloud auth activate-service-account --key-file=$${keyPathVolumeDefinition.mountPoint.name}/${keyFileName} && \
gcloud container clusters get-credentials $${nameVarName} --zone=$${zoneVarName} --project=$${projectVarName} && \
kubectl describe secret $${tokenNameVarName} --namespace=$${namespaceVarName}
"`; // kubectl commands may fail if the object exists, that's why we execute no matter what
    },
  );
}

async function lookupCertAndEndpoint(params) {
  return callCommand(
    params,
    (stdout) => ({
      certificate: extractTagValue(stdout, "certificate-authority-data:"),
      endpoint: extractTagValue(stdout, "server:"),
    }),
    (
      environmentalVariablesNames,
      keyPathVolumeDefinition,
      keyFileName,
    ) => {
      const {
        zone: zoneVarName,
        project: projectVarName,
        name: nameVarName,
        namespace: namespaceVarName,
      } = environmentalVariablesNames;

      return `\
sh -c "\
gcloud components install kubectl --quiet && \
gcloud components install gke-gcloud-auth-plugin --quiet && \
gcloud auth activate-service-account --key-file=$${keyPathVolumeDefinition.mountPoint.name}/${keyFileName} && \
gcloud container clusters get-credentials $${nameVarName} --zone=$${zoneVarName} --project=$${projectVarName} && \
kubectl config set-context --current --namespace=$${namespaceVarName} ; \
cat ~/.kube/config
"`; // kubectl commands may fail if the object exists, that's why we execute no matter what
    },
  );
}

async function callCommand(params, processOutputCb, createCommandCb) {
  const environmentalVariablesNames = Object.fromEntries(
    Object
      .keys(params)
      .map((key) => ([key, generateRandomEnvironmentVariableName()])),
  );

  const environmentalVariables = Object.fromEntries(
    Object
      .entries(environmentalVariablesNames)
      .map(([paramName, variableName]) => ([variableName, params[paramName]])),
  );

  const [keyPath, keyFileName] = splitDirectory(params.keyFilePath);
  const keyPathVolumeDefinition = docker.createVolumeDefinition(keyPath);
  // eslint-disable-next-line max-len
  environmentalVariables[keyPathVolumeDefinition.mountPoint.name] = keyPathVolumeDefinition.mountPoint.value;
  environmentalVariables[keyPathVolumeDefinition.path.name] = keyPathVolumeDefinition.path.value;

  const command = createCommandCb(
    environmentalVariablesNames,
    keyPathVolumeDefinition,
    keyFileName,
  );

  const builtCommand = docker.buildDockerCommand({
    command,
    image: GCLOUD_DOCKER_IMAGE,
    volumeDefinitionsArray: [keyPathVolumeDefinition],
  });

  const defaultEnvironmentalVariables = process.env;
  delete defaultEnvironmentalVariables.DOCKER_HOST;

  const result = await exec(builtCommand, {
    env: {
      ...defaultEnvironmentalVariables,
      ...environmentalVariables,
    },
  });

  const {
    stdout,
    stderr,
  } = result;
  if (!stdout && stderr) {
    throw new Error(stderr);
  }

  return processOutputCb(stdout);
}

function extractSecret(result) {
  const lines = result.split("\n");
  const tokenLine = lines.find((line) => line.includes("Tokens:"));

  return tokenLine.split(" ").filter(Boolean)[1];
}

function extractTagValue(result, tag) {
  const tagStartIndex = result.indexOf(tag);
  const resultStartingWithTag = result.slice(tagStartIndex + tag.length).trim();

  const tagEndIndex = resultStartingWithTag.indexOf("\n");
  const tagValue = tagEndIndex < 0
    ? resultStartingWithTag
    : resultStartingWithTag.slice(0, tagEndIndex + 1).trim();

  return tagValue;
}

module.exports = {
  createServiceAccount,
  lookupToken,
  lookupCertAndEndpoint,
};
