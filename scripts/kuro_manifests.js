const {writeFileSync, readFileSync, existsSync} = require('fs');

let INDEX = {
    wuwa: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/launcher/game/G153/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/index.json",
        launcher: "https://prod-alicdn-gamestarter.kurogame.com/launcher/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/index.json",
        cdn: "https://hw-pcdownload-aws.aki-game.net"
    },
    pgr: {
        game: "https://prod-alicdn-gamestarter.kurogame.com/launcher/game/G143/50015_LWdk9D2Ep9mpJmqBZZkcPBU2YNraEWBQ/index.json",
        launcher: "https://prod-alicdn-gamestarter.kurogame.com/launcher/launcher/50015_LWdk9D2Ep9mpJmqBZZkcPBU2YNraEWBQ/G143/index.json",
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

async function queryIndex(biz) {
    let rsp = await fetch((biz === "wuwa_global") ? `${INDEX.wuwa.game}` : `${INDEX.pgr.game}`);
    if (rsp.status !== 200) return null;
    let r = await rsp.json();

    let rsp1 = await fetch((biz === "wuwa_global") ? `${INDEX.wuwa.launcher}` : `${INDEX.pgr.launcher}`);
    if (rsp1.status !== 200) return null;
    let r1 = await rsp1.json();

    let bgcdn = (biz === "wuwa_global") ? `https://prod-alicdn-gamestarter.kurogame.com/launcher/50004_obOHXFrFanqsaIEOmuKroCcbZkQRBC7c/G153/background/${r1.functionCode.background}/en.json` : `https://prod-alicdn-gamestarter.kurogame.com/launcher/50015_LWdk9D2Ep9mpJmqBZZkcPBU2YNraEWBQ/G143/background/${r1.functionCode.background}/en.json`;
    let rsp2 = await fetch(`${bgcdn}`);
    if (rsp2.status !== 200) return null;
    let r2 = await rsp2.json();

    let cdnbase = (biz === "wuwa_global") ? `${INDEX.wuwa.cdn}` : `${INDEX.pgr.cdn}`;
    let preload = {};

    if (r.hasOwnProperty("predownload")) {
        preload = {
            resource_base: `${cdnbase}/${r.predownload.resourcesBasePath}`,
            resources_list: `${cdnbase}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: r.predownload.resourcesDiff.previousGameInfo.version,
            current_version: r.predownload.resourcesDiff.currentGameInfo.version,
            index_file: `${cdnbase}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patch_config: r.predownload.config.patchConfig
        };
    }

    return {
        background_url: (r2.backgroundFileType === 2) ? r2.firstFrameImage : r2.firstFrameImage,
        icon_url: (biz === "wuwa_global") ? "https://wutheringwaves.kurogames.com/static4.0/favicon.ico" : "https://cdnstatic.kurogame.net/h5_manage_dist/pgr_website2.0/favicon.png",
        latest_resource_base: `${cdnbase}/${r.default.resourcesBasePath}`,
        latest_resources_list: `${cdnbase}/${r.default.resources}`,
        latest_version: r.default.version,
        previous_version: r.default.resourcesDiff.previousGameInfo.version,
        current_version: r.default.resourcesDiff.currentGameInfo.version,
        exe_file: r.keyFileCheckList[0],
        latest_index_file: `${cdnbase}/${r.default.config.indexFile}`,
        latest_version_size: {compressed_size: r.default.config.size, decompressed_size: r.default.config.unCompressSize},
        patch_config: r.default.config.patchConfig,
        preload: preload
    }
}

async function generateManifest(biz) {
    let index = await queryIndex(biz);
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url}
    let pkg = await formatPackages(biz, index.latest_index_file, index.latest_version_size, index.patch_config);

    let final = {};
    switch (biz) {
        case "wuwa_global": {
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
                        fps_unlocker: true,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        override_runner: {
                            linux: {
                                enabled: false,
                                runner_version: ""
                            },
                            macos: {
                                enabled: false,
                                runner_version: ""
                            }
                        }
                    },
                    preload: await formatPreload(biz, index.preload, "WutheringWaves")
                }
            };
        }
        break;
        case "pgr_global": {
            let metadatainfo = {versioned_name: `PunishingGrayRaven ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_RAW", game_hash: "",
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
                    compat_overrides: {
                        install_to_prefix: false,
                        override_runner: {
                            linux: {
                                enabled: false,
                                runner_version: ""
                            },
                            macos: {
                                enabled: false,
                                runner_version: ""
                            }
                        }
                    },
                    preload: await formatPreload(biz, index.preload, "PunishingGrayRaven")
                }
            };
        }
        break;
    }
    return final;
}

async function formatPackages(biz, manifest, sizes, patches) {
    let cdnbase = (biz === "wuwa_global") ? `${INDEX.wuwa.cdn}` : `${INDEX.pgr.cdn}`;
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
        let index = (e.version > "2.0.2") ? `${cdnbase}/${e.indexFile}` : `${cdnbase}/${e.indexFile}`;
        return dg.push({
            file_url: index,
            compressed_size: `${e.size}`,
            decompressed_size: `${e.unCompressSize}`,
            file_hash: `${cdnbase}/${e.baseUrl}`,
            diff_type: "krdiff",
            original_version: e.version,
            delete_files: []
        });
    });

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

async function formatPreload(biz, pkgs, name) {
    let cdnbase = (biz === "wuwa_global") ? `${INDEX.wuwa.cdn}` : `${INDEX.pgr.cdn}`;
    let preloaddata = {};

    if (pkgs.hasOwnProperty("index_file")) {
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
                file_url: `${cdnbase}/${e.indexFile}`,
                compressed_size: `${e.size}`,
                decompressed_size: `${e.unCompressSize}`,
                file_hash: `${cdnbase}/${e.baseUrl}`,
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

generateManifest("wuwa_global").then(r => writeFileSync(wuwapath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("pgr_global").then(r => writeFileSync(pgrpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
