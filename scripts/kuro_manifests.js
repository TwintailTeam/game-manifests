const {writeFileSync, readFileSync, existsSync} = require('fs');

let INDEX = {
    wuwa: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/launcher/game/G153/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/index.json",
        launcher: "https://prod-alicdn-gamestarter.kurogame.com/launcher/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/index.json",
        cdn: "https://hw-pcdownload-aws.aki-game.net"
    },
    pgr: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/pcstarter/prod/game/G143/4/index.json",
        launcher: "https://zspms-alicdn-gamestarter.kurogame.net/pcstarter/prod/starter/4/G143/guidance/en.json",
        cdn: "https://zspms-alicdn-gamestarter.kurogame.net"
    }
};

let wuwahosts = ["pc.crashsight.wetest.net", "sentry.aki.kuro.com"];
let wuwapath = `${__dirname}/generated/wuwa_global.json`;
let wuwafps = ["120"];

let pgrhosts = [];
let pgrpath = `${__dirname}/generated/pgr_global.json`;
let pgrfps = ["120"];

// === WUWA ===

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

    let preload = {};

    if (r.hasOwnProperty("predownload")) {
        preload = {
            resource_base: `${INDEX.wuwa.cdn}/${r.predownload.resourcesBasePath}`,
            resources_list: `${INDEX.wuwa.cdn}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: r.predownload.resourcesDiff.previousGameInfo.version,
            current_version: r.predownload.resourcesDiff.currentGameInfo.version,
            index_file: `${INDEX.wuwa.cdn}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patch_config: r.predownload.config.patchConfig
        };
    }

    return {
        background_url: r2.firstFrameImage,
        icon_url: "https://wutheringwaves.kurogames.com/static4.0/favicon.ico",
        latest_resource_base: `${INDEX.wuwa.cdn}/${r.default.resourcesBasePath}`,
        latest_resources_list: `${INDEX.wuwa.cdn}/${r.default.resources}`,
        latest_version: r.default.version,
        previous_version: r.default.resourcesDiff.previousGameInfo.version,
        current_version: r.default.resourcesDiff.currentGameInfo.version,
        exe_file: r.keyFileCheckList[0],
        latest_index_file: `${INDEX.wuwa.cdn}/${r.default.config.indexFile}`,
        latest_version_size: {compressed_size: r.default.config.size, decompressed_size: r.default.config.unCompressSize},
        patch_config: r.default.config.patchConfig,
        preload: preload
    }
}

async function generateWuwaManifest() {
    let index = await queryWuwaIndex();
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url}
    let pkg = await formatWuwaPackages(index.latest_index_file, index.latest_version_size, index.patch_config);

    let final;

    let metadatainfo = {versioned_name: `WutheringWaves ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_RAW", game_hash: "",
        index_file: `${index.latest_index_file}`,
        res_list_url: `${index.latest_resource_base}`,
        diff_list_url: {
            game: "",
            en_us: "",
            zh_cn: "",
            ja_jp: "",
            ko_kr: "",
        }
    };
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
        paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
        assets: assetcfg,
        telemetry_hosts: wuwahosts,
        extra: {
            fps_unlock_options: wuwafps,
            switches: {
                fps_unlocker: false,
                jadeite: true,
                xxmi: true
            },
            preload: await formatWuwaPreload(index.preload, "WutheringWaves")
        }
    };

    return final;
}

async function formatWuwaPackages(manifest, sizes, patches) {
    let fg = [];
    let fa = [];
    let dg = [];
    let da = [];

    fg.push({
        file_url: `${manifest}`,
        compressed_size: `${sizes.compressed_size}`,
        decompressed_size: `${sizes.decompressed_size}`,
        file_hash: "",
        file_path: ""
    });

    patches.forEach(e => {
        let index = (e.version > "2.0.2") ? `${INDEX.wuwa.cdn}/${e.indexFile}` : `${INDEX.wuwa.cdn}/${e.indexFile}`;
        return dg.push({
            file_url: index,
            compressed_size: `${e.size}`,
            decompressed_size: `${e.unCompressSize}`,
            file_hash: `${INDEX.wuwa.cdn}/${e.baseUrl}`,
            diff_type: "krdiff",
            original_version: e.version,
            delete_files: []
        });
    });

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

async function formatWuwaPreload(pkgs, name) {
    let preloaddata = {};

    if (pkgs.hasOwnProperty("patches")) {
        let pfg = [];
        let pfa = [];
        let pdg = [];
        let pda = [];

        pfg.push({
            file_url: `${pkgs.index_file}`,
            compressed_size: `${pkgs.version_size.compressed_size}`,
            decompressed_size: `${pkgs.version_size.decompressed_size}`,
            file_hash: "",
            file_path: ""
        });

        pkgs.patch_config.forEach(e => {
            return pdg.push({
                file_url: `${e.indexFile}`,
                compressed_size: `${e.size}`,
                decompressed_size: `${e.unCompressSize}`,
                file_hash: "",
                diff_type: "krdiff",
                original_version: e.version,
                delete_files: []
            });
        })

        let pmetadatainfo = {
            versioned_name: `${name} ${pkgs.version} Preload (Global)`,
            version: pkgs.version,
            download_mode: "DOWNLOAD_MODE_RAW",
            game_hash: "",
            index_file: `${pkgs.index_file}`,
            res_list_url: `${pkgs.resource_base}`,
            diff_list_url: {
                game: "",
                en_us: "",
                zh_cn: "",
                ja_jp: "",
                ko_kr: "",
            }
        }

        preloaddata = {
            metadata: pmetadatainfo,
            game: {full: pfg, diff: pdg},
            audio: {full: pfa, diff: pda}
        }
    }

    return preloaddata;
}

// === PGR ===

async function queryPGRIndex() {
    let rsp = await fetch(`${INDEX.pgr.game}`);
    if (rsp.status !== 200) return null;
    let r = await rsp.json();

    let rsp1 = await fetch(`${INDEX.pgr.launcher}`);
    if (rsp1.status !== 200) return null;
    let r1 = await rsp1.json();

    let preload = {};

    if (r.hasOwnProperty("predownload")) {
        preload = {
            resource_base: `${INDEX.pgr.cdn}/${r.predownload.resourcesBasePath}`,
            resources_list: `${INDEX.pgr.cdn}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: r.predownload.resourcesDiff.previousGameInfo.version,
            current_version: r.predownload.resourcesDiff.currentGameInfo.version,
            index_file: `${INDEX.pgr.cdn}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patch_config: r.predownload.config.patchConfig
        };
    }

    return {
        background_url: `${r1.slideshow[0].url}`,
        icon_url: "https://cdnstatic.kurogame.net/h5_manage_dist/pgr_website2.0/favicon.png",
        latest_resource_base: `${INDEX.pgr.cdn}/${r.default.resourcesBasePath}`,
        latest_resources_list: `${INDEX.pgr.cdn}/${r.default.resources}`,
        latest_version: r.default.version,
        previous_version: r.default.resourcesDiff.previousGameInfo.version,
        current_version: r.default.resourcesDiff.currentGameInfo.version,
        exe_file: "PGR.exe",//r.keyFileCheckList[0],
        //latest_version_size: {compressed_size: r.default.config.size, decompressed_size: r.default.config.unCompressSize},
        //patch_config: r.default.config.patchConfig,
        preload: preload
    }
}

async function generatePGRManifest() {
    let index = await queryPGRIndex();
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url}
    let pkg = await formatPGRPackages(index.latest_resources_list, null, null);

    let final;

    let metadatainfo = {versioned_name: `PunishingGrayRaven ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_RAW", game_hash: "",
        index_file: `${index.latest_resources_list}`,
        res_list_url: `${index.latest_resource_base}`,
        diff_list_url: {
            game: "",
            en_us: "",
            zh_cn: "",
            ja_jp: "",
            ko_kr: "",
        }
    };
    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: {full: pkg.full_game, diff: pkg.diff_game},
        audio: {full: pkg.full_audio, diff: pkg.diff_audio}
    };

    let gameversions = [];
    // append version
    if (process.argv[2] === "append") {
        if (existsSync(pgrpath)) {
            let currentf = readFileSync(pgrpath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== index.current_version) {gameversions.push(v);}
            });
        } else {gameversions.push(versioninfo);}
    } else {gameversions.push(versioninfo);}

    final = {
        version: 1,
        display_name: "PunishingGrayRaven (Global)",
        biz: "pgr_global",
        latest_version: index.latest_version,
        game_versions: gameversions,
        paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
        assets: assetcfg,
        telemetry_hosts: pgrhosts,
        extra: {
            fps_unlock_options: pgrfps,
            switches: {
                fps_unlocker: false,
                jadeite: false,
                xxmi: false
            },
            preload: {}//await formatWuwaPreload(index.preload, "PunishingGrayRaven")
        }
    };

    return final;
}

async function formatPGRPackages(manifest, _sizes, _patches) {
    let fg = [];
    let fa = [];
    let dg = [];
    let da = [];

    let rsp = await fetch(`${manifest}`);
    let r = await rsp.json();
    // PS: Thanks kuro... PROVIDE DAMN GAME SIZE YOU FUCKS
    let totalSize = 0;
    for (let i = 0; i < r.resource.length; i++) {
        totalSize += r.resource[i].size;
    }

    fg.push({
        file_url: `${manifest}`,
        compressed_size: `${totalSize}`,
        decompressed_size: `${totalSize}`,
        file_hash: "",
        file_path: ""
    });

    /*patches.forEach(e => {
        let index = (e.version > "2.0.2") ? `${INDEX.wuwa.cdn}/${e.indexFile}` : `${INDEX.wuwa.cdn}/${e.indexFile}`;
        return dg.push({
            file_url: index,
            compressed_size: `${e.size}`,
            decompressed_size: `${e.unCompressSize}`,
            file_hash: "",
            diff_type: "krdiff",
            original_version: e.version,
            delete_files: []
        });
    });*/

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

generateWuwaManifest().then(r => writeFileSync(wuwapath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generatePGRManifest().then(r => writeFileSync(pgrpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
