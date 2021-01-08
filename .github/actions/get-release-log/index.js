const github = require('@actions/github');
const core = require('@actions/core');
const process = require("process")

const LAST_VERSION_DEFAULT = "V0.0.0";
const GET_VERSION_RE = /\d+(\.\d+)+/g;

// https://stackoverflow.com/questions/34810995/how-is-version-number-comparison-working-correctly-in-javascript
/*  
    compareVersion compares two version strings in the format
        '0.0.1' <v1> and '0.0.2' <v2>
    and compares them, returning 0 for v1 = v2, 1 for v1 > v2, or -1 for v1 < v2.
    @param string v1: Version to compare.
    @param string v2: Version to compare with.
    @return integer: 0 for v1 = v2, 1 for v1 > v2, or -1 for v1 < v2
*/
const compareVersion = (v1, v2) => {
    let arr1 = v1.split('.').map(Number);
    let arr2 = v2.split('.').map(Number);

    let i, result = 0, l = Math.max(arr1.length, arr2.length);
    for (i = 0; !result && i < l; i++) {
        result = (arr1[i] || 0) - (arr2[i] || 0);
    }
    if (result) {
        return result > 0 ? 1 : -1
    }
    return result;
}

/*
    run()
    Fetch PR titles merged uptill this version
    and set output parameter release_log with the data.
    - Action Input Parameters
        - current-version
            - current version in version.ini.
        - base-ref
            - base branch of PRs to match and add to release log.
        - api-token
            - GitHub API Token.
    - Action Output Parameters
        - release_log
            - generated release_log.
        - last_version
            - last release version (tag name of release).
    - Get API token from Action Input
    - Setup Octokit
    - Get the latestRelease of the repository,
      if the release exists set latestReleaseSha using
      listTags and match latestRealease.tag_name.
    - If current version <= last version, set exit code to 1 and exit.
    - Fetch all pull requests that are closed.
    - Iterate over pull requests,
      if latestReleaseSha is set, break if the current merge_commit_sha is latestReleaseSha
    - If the PR is merged to baseRef (default: master), add to release log.
*/

async function run() {
    let release_log = "";

    let currentVersion = core.getInput('current-version');

    let baseRef = core.getInput('base-ref');

    const apiToken = core.getInput('api-token');

    const octokit = new github.GitHub(apiToken);

    const context = github.context;

    let latestReleaseSha = "";
    let lastVersion = LAST_VERSION_DEFAULT;

    // Fetch latest release information.
    try {
        const { data: latestRelease } = await octokit.repos.getLatestRelease({
            ...context.repo
        });
        lastVersion = latestRelease.tag_name;
        core.setOutput('last_version', lastVersion);

        console.log(`latest release: ${latestRelease.name}`);

        // Set release commit from release tag.
        const { data: tagsList } = await octokit.repos.listTags({
            ...context.repo,
        });

        // It is certain that a tag will be found as the release tag is used to filter
        // thus tagFiltered[0] will not cause an error.
        tagFiltered = tagsList.filter(tag => tag.name === latestRelease.tag_name);
        latestReleaseSha = tagFiltered[0].commit.sha

        console.log(`latestReleaseSha: ${latestReleaseSha}`);
    // No release exists
    } catch (erorr) {
        console.log("No release exists, setting last_version to 0.0");
        core.setOutput('last_version', lastVersion);
    }

    // Compare current version and last version.
    // If indexing into array fails, no version was found,
    // it will raise exception, and exit action.
    try {
        currentVersion = currentVersion.match(GET_VERSION_RE)[0];
        lastVersion = lastVersion.match(GET_VERSION_RE)[0];
        console.log(currentVersion, lastVersion);
    } catch (error) {
        console.log(error.message);
        core.setFailed('Could not parse version.')
        process.exit(1);
    }

    console.log(`Current version: ${currentVersion}\nLast version: ${lastVersion}\n`)

    if (compareVersion(currentVersion, lastVersion) < 1) {
        core.setFailed("Lesser or equivalent version, exiting...");
        process.exit(1);
    } else {
        console.log("Building new package...");
    }

    const { data: pullRequestList } = await octokit.pulls.list({
        ...context.repo,
        state: 'closed',
    });

    for (var pullRequest of pullRequestList) {
        if (latestReleaseSha !== "") {
            if (latestReleaseSha === pullRequest.merge_commit_sha) {
                break;
            }
        }

        // Check if PR base is correct (default: master).
        if (pullRequest.base.ref !== baseRef) {
            continue;
        }

        const prNumber = pullRequest.number;
        const prTitle = pullRequest.title;

        console.log(`PR: ${prNumber} ${prTitle}`);

        const result = await octokit.graphql(
        `query result($owner: String!, $repo: String!, $number: Int!) {
            repository(owner: $owner, name: $repo) {
                pullRequest(number: $number) {
                    merged
                }
            }
        }`, {
            owner: context.repo.owner,
            repo: context.repo.repo,
            number: prNumber
        });

        prMerged = result.repository.pullRequest.merged

        if (prMerged) {
            console.log(`Adding PR to release log #${prNumber}: ${prTitle}`);
            release_log += `- ${prTitle} (#${prNumber})\n`;
        }

    }

    console.log("Generated release log")
    console.log(release_log)
    core.setOutput('release_log', release_log)
}

run();
