const {writeFileSync} = require('fs');

// generateManifest() returns null when a vendor API call fails. Writing that straight out is how
// sdsgc_global.json got replaced with "null", so refuse anything that isn't a manifest, keep the
// existing file and exit non-zero instead.
async function saveManifest(path, pending) {
    try {
        let manifest = await pending;
        if (!manifest || !manifest.biz || !Array.isArray(manifest.game_versions) || manifest.game_versions.length === 0) {
            throw new Error(`generator returned ${String(JSON.stringify(manifest)).slice(0, 80)}`);
        }
        writeFileSync(path, JSON.stringify(manifest, null, 2), {encoding: "utf8"});
    } catch (e) {
        console.error(`Not writing ${path}: ${e.message}`);
        process.exitCode = 1;
    }
}

module.exports = {saveManifest};
