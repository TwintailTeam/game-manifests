const {writeFileSync, readFileSync, existsSync} = require('fs');

let CDN_BASE = "https://hw-pcdownload-aws.aki-game.net";

let INDEX = {
    wuwa: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/launcher/game/G153/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/index.json",
        launcher: "https://prod-alicdn-gamestarter.kurogame.com/launcher/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/index.json"
    }
};

let wuwahosts = ["pc.crashsight.wetest.net", "sentry.aki.kuro.com"];
let wuwapath = `${__dirname}/generated_tests/wuwa_global.json`;
let wuwafps = ["120"];

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
            resource_base: `${CDN_BASE}/${r.predownload.resourcesBasePath}`,
            resources_list: `${CDN_BASE}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: r.predownload.resourcesDiff.previousGameInfo.version,
            current_version: r.predownload.resourcesDiff.currentGameInfo.version,
            index_file: `${CDN_BASE}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patch_config: r.predownload.config.patchConfig
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
        let index = (e.version > "2.0.2") ? `${CDN_BASE}/${e.indexFile}` : `${CDN_BASE}/${e.indexFile}`;
        return dg.push({
            file_url: index,
            compressed_size: `${e.size}`,
            decompressed_size: `${e.unCompressSize}`,
            file_hash: "",
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

generateWuwaManifest().then(r => writeFileSync(wuwapath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
