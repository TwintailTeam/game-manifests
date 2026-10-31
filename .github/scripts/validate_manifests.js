// Gate between the generator scripts and the push to main. Every manifest from repository.json that
// differs from HEAD must still be a manifest and must keep every version HEAD had. Anything else is
// restored to HEAD so it can't be pushed, and listed in the "rejected" step output.
// Lives outside scripts/ because the workflow runs every scripts/*.js as a generator.
const {readFileSync, appendFileSync} = require('fs');
const {execFileSync} = require('child_process');

function check(prevText, nextText) {
    if (nextText === null) return "is missing";
    let next;
    try { next = JSON.parse(nextText); } catch (e) { return `not valid JSON (${e.message})`; }
    if (!next || typeof next !== "object" || Array.isArray(next)) return `top level is ${String(nextText).trim().slice(0, 20)} instead of a manifest object`;
    if (!Array.isArray(next.game_versions) || next.game_versions.length === 0) return "game_versions is missing or empty";
    if (!next.latest_version) return "latest_version is missing";

    if (prevText === null) return null; // new manifest, nothing to compare against
    let prev;
    try { prev = JSON.parse(prevText); } catch { return null; }
    if (!Array.isArray(prev?.game_versions)) return null; // HEAD itself was broken, any valid manifest is an improvement
    if (next.biz !== prev.biz) return `biz changed from ${prev.biz} to ${next.biz}`;

    let have = new Set(next.game_versions.map(v => v?.metadata?.version));
    let lost = prev.game_versions.map(v => v?.metadata?.version).filter(v => !have.has(v));
    if (lost.length > 0) return `would drop ${lost.length} existing version(s): ${lost.join(", ")}`;
    return null;
}

if (require.main === module) {
    const git = (...args) => execFileSync("git", args, {encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]});
    let manifests = JSON.parse(readFileSync("repository.json", "utf8")).manifests;
    let changed = git("diff", "--name-only", "HEAD", "--", ...manifests).split("\n").filter(Boolean);

    let rejected = [];
    for (let f of changed) {
        let prev = null, next = null;
        try { prev = git("show", `HEAD:${f}`); } catch {}
        try { next = readFileSync(f, "utf8"); } catch {}
        let problem = check(prev, next);
        if (problem === null) {
            console.log(`ok: ${f}`);
            continue;
        }
        console.log(`::error file=${f}::${f} ${problem}. Restored the committed version instead.`);
        git("checkout", "HEAD", "--", f);
        rejected.push(f);
    }
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `rejected=${rejected.join(" ")}\n`);
}

module.exports = {check};
