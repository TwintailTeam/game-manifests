const {writeFileSync, readFileSync, existsSync} = require('fs');

let CDN_BASE = "https://hw-pcdownload-aws.aki-game.net";

let INDEX = {
    wuwa: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/launcher/game/G153/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/index.json",
        launcher: "https://prod-alicdn-gamestarter.kurogame.com/launcher/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/index.json"
    }
};

let wuwahosts = [];
let wuwapath = `${__dirname}/generated/wuwa_global.json`;

async function queryWuwaIndex() {
    let rsp = await fetch(`${INDEX.wuwa.game}`);
    if (rsp.status !== 200) return null;
    let r = await rsp.json();

    let rsp1 = await fetch(`${INDEX.wuwa.launcher}`);
    if (rsp1.status !== 200) return null;
    let r1 = await rsp1.json();

    let rsp2 = await fetch(`https://prod-alicdn-gamestarter.kurogame.com/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/background/${r1.functionCode.background}/en.json`);
    if (rsp2.status !== 200) return null;
    let r2 = await rsp2.json();

    let rsp3 = await fetch(`${CDN_BASE}/${r.default.resources}`);
    if (rsp3.status !== 200) return null;
    let r3 = await rsp3.json();

    let fullgame = []
    let ptchs = []

    r3.resource.forEach((resource) => {
        fullgame.push({dest: `${resource.dest}`, url: `${CDN_BASE}/${r.default.resourcesBasePath}/${resource.dest}`, md5: resource.md5, sampleMd5: resource.sampleHash, size: resource.size});
    });

    r.default.config.patchConfig.forEach((config) => {
        if (config.version < "2.1.0") return;
        config["indexFile"] = `${CDN_BASE}/${config.indexFile}`;
        config["baseUrl"] = `${CDN_BASE}/${config.baseUrl}`;
        ptchs.push(config);
    });

    let preload = {};

    let fullgamepreload = []
    let ptchspreload = []

    if (r.predownload) {
        let rsp4 = await fetch(`${CDN_BASE}/${r.predownload.resources}`);
        if (rsp4.status !== 200) return null;
        let r4 = await rsp4.json();


        r4.resource.forEach((resource) => {
            fullgamepreload.push({dest: `${resource.dest}`, url: `${CDN_BASE}/${r.predownload.resourcesBasePath}/${resource.dest}`, md5: resource.md5, sampleMd5: resource.sampleHash, size: resource.size});
        });

        r.predownload.config.patchConfig.forEach((config) => {
            if (config.version < "2.1.0") return;
            config["indexFile"] = `${CDN_BASE}/${config.indexFile}`;
            config["baseUrl"] = `${CDN_BASE}/${config.baseUrl}`;
            ptchspreload.push(config);
        });

        preload = {
            resource_base: `${CDN_BASE}/${r.predownload.resourcesBasePath}`,
            resources_list: `${CDN_BASE}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: r.predownload.resourcesDiff.previousGameInfo.version,
            current_version: r.predownload.resourcesDiff.currentGameInfo.version,
            index_file: `${CDN_BASE}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patches: {
                diffs: ptchspreload,
                full: fullgamepreload,
            },
        };
    }

    return {
        background_url: r2.firstFrameImage,
        icon_url: "https://wutheringwaves.kurogames.com/static4.0/favicon.ico",
        latest_resource_base: `${CDN_BASE}/${r.default.resourcesBasePath}`,
        latest_resources_list: `${CDN_BASE}/${r.default.resources}`,
        latest_version: r.default.version,
        previous_version: r.default.resourcesDiff.previousGameInfo.version,
        current_version: r.default.resourcesDiff.currentGameInfo.version,
        exe_file: r.keyFileCheckList[0],
        latest_index_file: `${CDN_BASE}/${r.default.config.indexFile}`,
        latest_version_size: {compressed_size: r.default.config.size, decompressed_size: r.default.config.unCompressSize},
        patches: {
            diffs: ptchs,
            full: fullgame,
        },
        preload: preload
    }
}

async function generateWuwaManifest() {
    let index = await queryWuwaIndex();
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url}
    let pkg = await formatPackages(index.patches);

    let final;

    let metadatainfo = {versioned_name: `WutheringWaves ${index.current_version} (Global)`, version: index.current_version, game_hash: ""};
    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: {full: pkg.full_game, diff: pkg.diff_game},
        audio: {full: pkg.full_audio, diff: pkg.diff_audio}
    };

    let gameversions = [];
    // append version
    if (process.argv[2] === "append") {
        if (existsSync(wuwapath)) {
            let currentf = readFileSync(wuwapath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== index.current_version) {gameversions.push(v);}
            });
        } else {gameversions.push(versioninfo);}
    } else {gameversions.push(versioninfo);}

    final = {
        version: 1,
        display_name: "WutheringWaves (Global)",
        biz: "wuwa_global",
        latest_version: index.latest_version,
        game_versions: gameversions,
        paths: {exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
        assets: assetcfg,
        telemetry_hosts: wuwahosts,
        extra: {preload: await formatPreload(index.preload, "WutheringWaves")}
    };

    return final;
}

async function formatPackages(packages) {
    let fg = [];
    packages.full.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: "",
            decompressed_size: `${e.size}`,
            file_hash: e.md5,
            file_path: e.dest
        });
    });

    let fa = [];
    /*packages.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });*/

    let dg = [];
    await Promise.all(packages.diffs.map(async e => {
        const response = await fetch(`${e.indexFile}`);
        if (response.status !== 200) return;
        const data = await response.json();

        data.patchInfos.forEach(e2 => {
            return dg.push({
                file_url: `${e.baseUrl}${e2.dest}`,
                compressed_size: `${e.size}`,
                decompressed_size: `${e.unCompressSize}`,
                file_hash: "",
                diff_type: "krdiff",
                original_version: e.version,
                delete_files: data.deleteFiles
            });
        });
    }));

    let da = [];
    /*packages.diffs.forEach(e => {
        e.audio_pkgs.forEach(e2 => {
            return da.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "ldiff",
                original_version: e.version,
                language: e2.language
            });
        })
    });*/

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

async function formatPreload(pkgs, name) {
    let preloaddata;

    let pfg = [];
    pkgs.patches.full.forEach(e => {
        return pfg.push({
            file_url: e.url,
            compressed_size: "",
            decompressed_size: `${e.size}`,
            file_hash: e.md5,
            file_path: e.dest
        });
    });

    let pfa = [];
    /*packages.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });*/

    let pdg = [];
    await Promise.all(pkgs.patches.diffs.map(async e => {
        const response = await fetch(`${e.indexFile}`);
        if (response.status !== 200) return;
        const data = await response.json();

        data.patchInfos.forEach(e2 => {
            return pdg.push({
                file_url: `${e.baseUrl}${e2.dest}`,
                compressed_size: `${e.size}`,
                decompressed_size: `${e.unCompressSize}`,
                file_hash: "",
                diff_type: "krdiff",
                original_version: e.version,
                delete_files: data.deleteFiles
            });
        });
    }));

    let pda = [];
    /*packages.diffs.forEach(e => {
        e.audio_pkgs.forEach(e2 => {
            return da.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "ldiff",
                original_version: e.version,
                language: e2.language
            });
        })
    });*/

    let pmetadatainfo = {
        versioned_name: `${name} ${pkgs.version} Preload (Global)`,
        version: pkgs.version,
        game_hash: "",
    }

    preloaddata = {
        metadata: pmetadatainfo,
        game: {full: pfg, diff: pdg},
        audio: {full: pfa, diff: pda}
    }

    return preloaddata;
}

generateWuwaManifest().then(r => writeFileSync(wuwapath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
