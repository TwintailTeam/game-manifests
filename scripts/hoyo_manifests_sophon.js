const {writeFileSync, readFileSync, existsSync} = require('fs');

let API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGameComboInfo?channel=0&launcher_id=VYTpXlbWo8&sub_channel=0";
let BASICINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=VYTpXlbWo8&language=en-us&game_id=";
let GAMESINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGames?launcher_id=VYTpXlbWo8&language=en-us";

let gihosts = ["log-upload-os.hoyoverse.com", "overseauspider.yuanshen.com", "osuspider.yuanshen.com", "ys-log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "minor-api-os.hoyoverse.com"];
let hsrhosts = ["log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "minor-api-os.hoyoverse.com"];
let zzzhosts = ["apm-log-upload-os.hoyoverse.com", "zzz-log-upload-os.hoyoverse.com", "log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "minor-api-os.hoyoverse.com"];
let bhhosts = ["log-upload-os.hoyoverse.com", "dump.gamesafe.qq.com", "log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "down.anticheatexpert.com", "usa01-client-report.honkaiimpact3.com", "usa01-appsflyer-report.honkaiimpact3.com", "minor-api-os.hoyoverse.com"];
let hnahosts = ["log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "minor-api-os.hoyoverse.com"];
let pphosts = ["log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com", "minor-api-os.hoyoverse.com"];

let gifps = ["72", "90", "120", "144", "165", "180", "240", "360"];
let hsrfps = ["72", "90", "120"];
let zzzfps = ["120"];
let bh3fps = ["72", "90", "120", "144", "165", "180", "240", "360"];
let hnafps = ["72", "90", "120"];
let ppfps = ["72", "90", "120"];

let gipath = `${__dirname}/generated/hk4e_global.json`;
let hsrpath = `${__dirname}/generated/hkrpg_global.json`;
let zzzpath = `${__dirname}/generated/nap_global.json`;
let bhpath = `${__dirname}/generated/bh3_global.json`;
let hnapath = `${__dirname}/generated/abc_global.json`;
let pppath = `${__dirname}/generated/hyg_global.json`;

let gicompat = [];
let hsrcompat = [];
let zzzcompat = ["gamedrive"];
let bhcompat = [];
let hnacompat = [];
let ppcompat = [];

async function queryHoyoPlayApis() {
    let rsp = await fetch(`${API}`);
    let r = await rsp.json();

    let rsp1 = await fetch(`${BASICINFO_API}`);
    let r1 = await rsp1.json();

    let rsp2 = await fetch(`${GAMESINFO_API}`);
    let r2 = await rsp2.json();

    if (r.retcode !== 0 || r1.retcode !== 0 || r2.retcode !== 0) return null;

    let lc = r.data.launch_configs;
    let lce = [];
    lc.forEach((i) => {
        if (i.game.biz === "bh3_global" && i.game.id !== "5TIVvvcwtM") return;
        lce.push({
            game_biz: i.game.biz,
            exe_filename: i.exe_file_name,
            installation_dir: i.installation_dir,
            screenshot_dir: i.game_screenshot_dir,
            download_mode: i.default_download_mode,
            audio_pkg_res_dir: i.audio_pkg_res_dir
        });
    });

    let bi = r1.data.game_info_list;
    let gii = r2.data.games;
    let bgs = [];
    bi.forEach((i) => {
        if (i.game.biz === "bh3_global" && i.game.id !== "5TIVvvcwtM") return;
        bgs.push({
            game_biz: i.game.biz,
            background: i.backgrounds[0].background.url,
            background_video: (i.backgrounds[0].type === "BACKGROUND_TYPE_VIDEO") ? i.backgrounds[0].video.url : "",
            icon: gii.filter(e => e.biz === i.game.biz)[0].display.icon.url,
        });
    });

    let gb = r.data.game_branches;
    let br = [];
    gb.forEach((i) => {
        let region = "";
        if (i.game.biz === "bh3_global") {
            if (i.game.id === "5TIVvvcwtM") { region = "glb_official"; }
            if (i.game.id === "bxPTXSET5t") { region = "overseas_official"; }
            if (i.game.id === "uxB4MC7nzC") { region = "kr_official"; }
            if (i.game.id === "wkE5P5WsIf") { region = "asia_official"; }
            if (i.game.id === "g0mMIvshDb") { region = "jp_official"; }
        }
        br.push({
            game_biz: i.game.biz,
            game_id: i.game.id,
            main: i.main,
            preload: i.pre_download,
            region: region
        })
    })

    return {
        launch_configs: lce,
        branches: br,
        assets: bgs
    };
}

async function generateManifest(gameBiz) {
    let rsp = await queryHoyoPlayApis();
    if (rsp === null) return null;

    let assets = rsp.assets.filter(e => e.game_biz === gameBiz)[0];
    let config = rsp.launch_configs.filter(e => e.game_biz === gameBiz)[0];
    let branches = rsp.branches.filter(e => e.game_biz === gameBiz);

    let assetcfg = {game_icon: assets.icon, game_background: assets.background, game_live_background: assets.background_video}
    let pkgs = await formatPackages(branches, gameBiz);
    let pkg = pkgs[0];

    let final = {};
    switch (gameBiz) {
        case "hk4e_global": {
            let metadatainfo = {versioned_name: `GenshinImpact ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
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
                if (existsSync(gipath)) {
                    let currentf = readFileSync(gipath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "GenshinImpact (Global)",
                biz: "hk4e_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: gihosts,
                extra: {
                    fps_unlock_options: gifps,
                    switches: {
                        fps_unlocker: true,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: gicompat,
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
                    preload: await formatPreload(branches[0], "GenshinImpact", "hk4e_global")
                }
            };
        }
        break;
        case "hkrpg_global": {
            let metadatainfo = {versioned_name: `Honkai: StarRail ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
                }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: pkg.full_game, diff: pkg.diff_game},
                audio: {full: pkg.full_audio, diff: pkg.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(hsrpath)) {
                    let currentf = readFileSync(hsrpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Honkai: StarRail (Global)",
                biz: "hkrpg_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "data_dir"},
                assets: assetcfg,
                telemetry_hosts: hsrhosts,
                extra: {
                    fps_unlock_options: hsrfps,
                    switches: {
                        fps_unlocker: true,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: true,
                        block_first_req: true,
                        proton_compat_config: hsrcompat,
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
                    preload: await formatPreload(branches[0], "Honkai: StarRail", "hkrpg_global")
                }
            };
        }
        break;
        case "nap_global": {
            let metadatainfo = {versioned_name: `ZenlessZoneZero ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
                }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: pkg.full_game, diff: pkg.diff_game},
                audio: {full: pkg.full_audio, diff: pkg.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(zzzpath)) {
                    let currentf = readFileSync(zzzpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "ZenlessZoneZero (Global)",
                biz: "nap_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: zzzhosts,
                extra: {
                    fps_unlock_options: zzzfps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: zzzcompat,
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
                    preload: await formatPreload(branches[0], "ZenlessZoneZero", "nap_global")
                }
            };
        }
        break;
        case "bh3_global": {
            let metadatainfo = {versioned_name: `HonkaiImpact 3rd ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
                }
            }

            let p = [];
            for (const pp of pkgs) {
                for (const fullg of pp.full_game) { p.push(fullg); }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: p, diff: pkg.diff_game},
                audio: {full: pkg.full_audio, diff: pkg.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(bhpath)) {
                    let currentf = readFileSync(bhpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "HonkaiImpact 3rd (Global)",
                biz: "bh3_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: bhhosts,
                extra: {
                    fps_unlock_options: bh3fps,
                    switches: {
                        fps_unlocker: true,
                        jadeite: true,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: bhcompat,
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
                    preload: await formatPreload(branches[0], "HonkaiImpact 3rd", "bh3_global")
                }
            };
        }
        break;
        case "abc_global": {
            let metadatainfo = {versioned_name: `Honkai: NexusAnima ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
                }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: pkg.full_game, diff: pkg.diff_game},
                audio: {full: pkg.full_audio, diff: pkg.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(hnapath)) {
                    let currentf = readFileSync(hnapath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Honkai: NexusAnima (Global)",
                biz: "abc_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: hnahosts,
                extra: {
                    fps_unlock_options: hnafps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: hnacompat,
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
                    preload: await formatPreload(branches[0], "Honkai: NexusAnima", "abc_global")
                }
            };
        }
        break;
        case "hyg_global": {
            let metadatainfo = {versioned_name: `PetitPlanet ${branches[0].main.tag} (Global)`, version: branches[0].main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: `${pkg.chunk_base}`,
                diff_list_url: {
                    game: `${pkg.game_diff}`,
                    en_us: `${pkg.en_diff}`,
                    zh_cn: `${pkg.cn_diff}`,
                    ja_jp: `${pkg.jp_diff}`,
                    ko_kr: `${pkg.kr_diff}`,
                }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: pkg.full_game, diff: pkg.diff_game},
                audio: {full: pkg.full_audio, diff: pkg.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(pppath)) {
                    let currentf = readFileSync(pppath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches[0].main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "PetitPlanet (Global)",
                biz: "hyg_global",
                latest_version: branches[0].main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: pphosts,
                extra: {
                    fps_unlock_options: ppfps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: ppcompat,
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
                    preload: await formatPreload(branches[0], "PetitPlanet", "hyg_global")
                }
            };
        }
        break;
    }
    return final;
}

async function formatPackages(pkgs, biz) {
    let data = [];
    for (const packages of pkgs) {
        let manifest = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getBuild?branch=${packages.main.branch}&package_id=${packages.main.package_id}&password=${packages.main.password}&plat_app=${packages.game_id}&tag=${packages.main.tag}`;
        let rsp = await fetch(`${manifest}`);
        let r = await rsp.json();

        let diff = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getPatchBuild?branch=${packages.main.branch}&package_id=${packages.main.package_id}&password=${packages.main.password}&plat_app=${packages.game_id}&tag=${packages.main.tag}`;
        let rsp1 = await fetch(`${diff}`, {'method': 'POST'});
        let r1 = await rsp1.json();

        let fg = [];
        let fa = [];
        let dg = [];
        let da = [];

        if (r.retcode === 0 && r1.retcode === 0) {
            let d = r.data;
            let d1 = r1.data;

            let game = d.manifests.filter(e => e.matching_field === "game")[0];
            let en = d.manifests.filter(e => e.matching_field === "en-us")[0];
            let cn = d.manifests.filter(e => e.matching_field === "zh-cn")[0];
            let kr = d.manifests.filter(e => e.matching_field === "ko-kr")[0];
            let jp = d.manifests.filter(e => e.matching_field === "ja-jp")[0];

            if (biz === "nap_global" || biz === "bh3_global") {
                let exclude = ["game", "en-us", "zh-cn", "ko-kr", "ja-jp"];
                let rest = d.manifests.filter(e => !exclude.includes(e.matching_field));
                rest.forEach(e => {
                    fg.push({
                        file_url: `${e.manifest_download.url_prefix}/${e.manifest.id}`,
                        compressed_size: `${e.stats.compressed_size}`,
                        decompressed_size: `${e.stats.uncompressed_size}`,
                        file_hash: e.manifest.checksum,
                        file_path: `${e.chunk_download.url_prefix}`,
                        region_code: `${packages.region}`
                    });
                });

            }

            fg.push({
                file_url: `${game.manifest_download.url_prefix}/${game.manifest.id}`,
                compressed_size: `${game.stats.compressed_size}`,
                decompressed_size: `${game.stats.uncompressed_size}`,
                file_hash: game.manifest.checksum,
                file_path: `${game.chunk_download.url_prefix}`,
                region_code: `${packages.region}`
            });

            let gameDiff = d1.manifests.filter(e => e.matching_field === "game")[0];
            let enDiff = d1.manifests.filter(e => e.matching_field === "en-us")[0];
            let cnDiff = d1.manifests.filter(e => e.matching_field === "zh-cn")[0];
            let krDiff = d1.manifests.filter(e => e.matching_field === "ko-kr")[0];
            let jpDiff = d1.manifests.filter(e => e.matching_field === "ja-jp")[0];

            packages.main.diff_tags.forEach(v => {
                if (biz === "nap_global") {
                    let exclude = ["game", "en-us", "zh-cn", "ko-kr", "ja-jp"];
                    let rest = d1.manifests.filter(e => !exclude.includes(e.matching_field));
                    rest.forEach(e => {
                        if (e.stats.hasOwnProperty(`${v}`)) {
                            dg.push({
                                file_url: `${e.manifest_download.url_prefix}/${e.manifest.id}`,
                                compressed_size: `${e.stats[v].compressed_size}`,
                                decompressed_size: `${e.stats[v].uncompressed_size}`,
                                file_hash: `${e.diff_download.url_prefix}`,
                                diff_type: "ldiff",
                                original_version: v,
                                delete_files: []
                            });
                        }
                    })
                }

                dg.push({
                    file_url: `${gameDiff.manifest_download.url_prefix}/${gameDiff.manifest.id}`,
                    compressed_size: `${gameDiff.stats[v].compressed_size}`,
                    decompressed_size: `${gameDiff.stats[v].uncompressed_size}`,
                    file_hash: `${gameDiff.diff_download.url_prefix}`,
                    diff_type: "ldiff",
                    original_version: v,
                    delete_files: []
                });

                if (biz !== "bh3_global") {
                    da.push({
                        file_url: `${enDiff.manifest_download.url_prefix}/${enDiff.manifest.id}`,
                        compressed_size: `${enDiff.stats[v].compressed_size}`,
                        decompressed_size: `${enDiff.stats[v].uncompressed_size}`,
                        file_hash: `${enDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: enDiff.matching_field
                    });

                    da.push({
                        file_url: `${cnDiff.manifest_download.url_prefix}/${cnDiff.manifest.id}`,
                        compressed_size: `${cnDiff.stats[v].compressed_size}`,
                        decompressed_size: `${cnDiff.stats[v].uncompressed_size}`,
                        file_hash: `${cnDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: cnDiff.matching_field
                    });

                    da.push({
                        file_url: `${krDiff.manifest_download.url_prefix}/${krDiff.manifest.id}`,
                        compressed_size: `${krDiff.stats[v].compressed_size}`,
                        decompressed_size: `${krDiff.stats[v].uncompressed_size}`,
                        file_hash: `${krDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: krDiff.matching_field
                    });

                    da.push({
                        file_url: `${jpDiff.manifest_download.url_prefix}/${jpDiff.manifest.id}`,
                        compressed_size: `${jpDiff.stats[v].compressed_size}`,
                        decompressed_size: `${jpDiff.stats[v].uncompressed_size}`,
                        file_hash: `${jpDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: jpDiff.matching_field
                    });
                }
            });

            if (biz !== "bh3_global") {
                fa.push({
                    file_url: `${en.manifest_download.url_prefix}/${en.manifest.id}`,
                    compressed_size: `${en.stats.compressed_size}`,
                    decompressed_size: `${en.stats.uncompressed_size}`,
                    file_hash: en.manifest.checksum,
                    language: en.matching_field,
                    region_code: `${packages.region}`
                });

                fa.push({
                    file_url: `${cn.manifest_download.url_prefix}/${cn.manifest.id}`,
                    compressed_size: `${cn.stats.compressed_size}`,
                    decompressed_size: `${cn.stats.uncompressed_size}`,
                    file_hash: cn.manifest.checksum,
                    language: cn.matching_field,
                    region_code: `${packages.region}`
                });

                fa.push({
                    file_url: `${kr.manifest_download.url_prefix}/${kr.manifest.id}`,
                    compressed_size: `${kr.stats.compressed_size}`,
                    decompressed_size: `${kr.stats.uncompressed_size}`,
                    file_hash: kr.manifest.checksum,
                    language: kr.matching_field,
                    region_code: `${packages.region}`
                });

                fa.push({
                    file_url: `${jp.manifest_download.url_prefix}/${jp.manifest.id}`,
                    compressed_size: `${jp.stats.compressed_size}`,
                    decompressed_size: `${jp.stats.uncompressed_size}`,
                    file_hash: jp.manifest.checksum,
                    language: jp.matching_field,
                    region_code: `${packages.region}`
                });
            }
            data.push({full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da,
                game_diff: (biz !== "bh3_global") ? gameDiff.diff_download.url_prefix : "",
                en_diff: (biz !== "bh3_global") ? enDiff.diff_download.url_prefix : "",
                cn_diff: (biz !== "bh3_global") ? cnDiff.diff_download.url_prefix : "",
                jp_diff: (biz !== "bh3_global") ? jpDiff.diff_download.url_prefix : "",
                kr_diff: (biz !== "bh3_global") ? krDiff.diff_download.url_prefix : "",
                chunk_base: game.chunk_download.url_prefix
            });
        }
    }
    return data;
}

async function formatPreload(pkgs, name, biz) {
    let preloaddata = {};

    if (pkgs.preload !== null) {
        let manifest = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getBuild?branch=${pkgs.preload.branch}&package_id=${pkgs.preload.package_id}&password=${pkgs.preload.password}&plat_app=${pkgs.game_id}`;
        let rsp = await fetch(`${manifest}`);
        let r = await rsp.json();

        let diff = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getPatchBuild?branch=${pkgs.preload.branch}&package_id=${pkgs.preload.package_id}&password=${pkgs.preload.password}&plat_app=${pkgs.game_id}`;
        let rsp1 = await fetch(`${diff}`, {'method': 'POST'});
        let r1 = await rsp1.json();

        let pfg = [];
        let pfa = [];
        let pdg = [];
        let pda = [];

        if (r.retcode === 0 && r1.retcode === 0) {
            let d = r.data;
            let d1 = r1.data;

            let game = d.manifests.filter(e => e.matching_field === "game")[0];
            let en = d.manifests.filter(e => e.matching_field === "en-us")[0];
            let cn = d.manifests.filter(e => e.matching_field === "zh-cn")[0];
            let kr = d.manifests.filter(e => e.matching_field === "ko-kr")[0];
            let jp = d.manifests.filter(e => e.matching_field === "ja-jp")[0];

            if (biz === "nap_global" || biz === "bh3_global") {
                let exclude = ["game", "en-us", "zh-cn", "ko-kr", "ja-jp"];
                let rest = d.manifests.filter(e => !exclude.includes(e.matching_field));
                rest.forEach(e => {
                    pfg.push({
                        file_url: `${e.manifest_download.url_prefix}/${e.manifest.id}`,
                        compressed_size: `${e.stats.compressed_size}`,
                        decompressed_size: `${e.stats.uncompressed_size}`,
                        file_hash: e.manifest.checksum,
                        file_path: `${e.chunk_download.url_prefix}`,
                        region_code: `${pkgs.region}`
                    });
                });
            }

            pfg.push({
                file_url: `${game.manifest_download.url_prefix}/${game.manifest.id}`,
                compressed_size: `${game.stats.compressed_size}`,
                decompressed_size: `${game.stats.uncompressed_size}`,
                file_hash: game.manifest.checksum,
                file_path: `${game.chunk_download.url_prefix}`,
                region_code: `${pkgs.region}`
            });

            let gameDiff = d1.manifests.filter(e => e.matching_field === "game")[0];
            let enDiff = d1.manifests.filter(e => e.matching_field === "en-us")[0];
            let cnDiff = d1.manifests.filter(e => e.matching_field === "zh-cn")[0];
            let krDiff = d1.manifests.filter(e => e.matching_field === "ko-kr")[0];
            let jpDiff = d1.manifests.filter(e => e.matching_field === "ja-jp")[0];

            pkgs.preload.diff_tags.forEach(v => {
                if (biz === "nap_global") {
                    let exclude = ["game", "en-us", "zh-cn", "ko-kr", "ja-jp"];
                    let rest = d1.manifests.filter(e => !exclude.includes(e.matching_field));
                    rest.forEach(e => {
                        if (e.stats.hasOwnProperty(`${v}`)) {
                            pdg.push({
                                file_url: `${e.manifest_download.url_prefix}/${e.manifest.id}`,
                                compressed_size: `${e.stats[v].compressed_size}`,
                                decompressed_size: `${e.stats[v].uncompressed_size}`,
                                file_hash: `${e.diff_download.url_prefix}`,
                                diff_type: "ldiff",
                                original_version: v,
                                delete_files: []
                            });
                        }
                    })
                }

                pdg.push({
                    file_url: `${gameDiff.manifest_download.url_prefix}/${gameDiff.manifest.id}`,
                    compressed_size: `${gameDiff.stats[v].compressed_size}`,
                    decompressed_size: `${gameDiff.stats[v].uncompressed_size}`,
                    file_hash: `${gameDiff.diff_download.url_prefix}`,
                    diff_type: "ldiff",
                    original_version: v,
                    delete_files: []
                });

                if (biz !== "bh3_global") {
                    pda.push({
                        file_url: `${enDiff.manifest_download.url_prefix}/${enDiff.manifest.id}`,
                        compressed_size: `${enDiff.stats[v].compressed_size}`,
                        decompressed_size: `${enDiff.stats[v].uncompressed_size}`,
                        file_hash: `${enDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: enDiff.matching_field
                    });

                    pda.push({
                        file_url: `${cnDiff.manifest_download.url_prefix}/${cnDiff.manifest.id}`,
                        compressed_size: `${cnDiff.stats[v].compressed_size}`,
                        decompressed_size: `${cnDiff.stats[v].uncompressed_size}`,
                        file_hash: `${cnDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: cnDiff.matching_field
                    });

                    pda.push({
                        file_url: `${krDiff.manifest_download.url_prefix}/${krDiff.manifest.id}`,
                        compressed_size: `${krDiff.stats[v].compressed_size}`,
                        decompressed_size: `${krDiff.stats[v].uncompressed_size}`,
                        file_hash: `${krDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: krDiff.matching_field
                    });

                    pda.push({
                        file_url: `${jpDiff.manifest_download.url_prefix}/${jpDiff.manifest.id}`,
                        compressed_size: `${jpDiff.stats[v].compressed_size}`,
                        decompressed_size: `${jpDiff.stats[v].uncompressed_size}`,
                        file_hash: `${jpDiff.manifest.checksum}`,
                        diff_type: "ldiff",
                        original_version: v,
                        language: jpDiff.matching_field
                    });
                }

            });

            if (biz !== "bh3_global") {
                pfa.push({
                    file_url: `${en.manifest_download.url_prefix}/${en.manifest.id}`,
                    compressed_size: `${en.stats.compressed_size}`,
                    decompressed_size: `${en.stats.uncompressed_size}`,
                    file_hash: en.manifest.checksum,
                    language: en.matching_field,
                    region_code: `${pkgs.region}`
                });

                pfa.push({
                    file_url: `${cn.manifest_download.url_prefix}/${cn.manifest.id}`,
                    compressed_size: `${cn.stats.compressed_size}`,
                    decompressed_size: `${cn.stats.uncompressed_size}`,
                    file_hash: cn.manifest.checksum,
                    language: cn.matching_field,
                    region_code: `${pkgs.region}`
                });

                pfa.push({
                    file_url: `${kr.manifest_download.url_prefix}/${kr.manifest.id}`,
                    compressed_size: `${kr.stats.compressed_size}`,
                    decompressed_size: `${kr.stats.uncompressed_size}`,
                    file_hash: kr.manifest.checksum,
                    language: kr.matching_field,
                    region_code: `${pkgs.region}`
                });

                pfa.push({
                    file_url: `${jp.manifest_download.url_prefix}/${jp.manifest.id}`,
                    compressed_size: `${jp.stats.compressed_size}`,
                    decompressed_size: `${jp.stats.uncompressed_size}`,
                    file_hash: jp.manifest.checksum,
                    language: jp.matching_field,
                    region_code: `${pkgs.region}`
                });
            }

            let pmetadatainfo = {
                versioned_name: `${name} ${pkgs.preload.tag} Preload (Global)`,
                version: pkgs.preload.tag,
                download_mode: "DOWNLOAD_MODE_CHUNK",
                game_hash: "",
                index_file: "",
                res_list_url: `${game.chunk_download.url_prefix}`,
                diff_list_url: {
                    game: (biz !== "bh3_global") ? `${gameDiff.diff_download.url_prefix}` : "",
                    en_us: (biz !== "bh3_global") ? `${enDiff.diff_download.url_prefix}` : "",
                    zh_cn: (biz !== "bh3_global") ? `${cnDiff.diff_download.url_prefix}` : "",
                    ja_jp: (biz !== "bh3_global") ? `${jpDiff.diff_download.url_prefix}` : "",
                    ko_kr: (biz !== "bh3_global") ? `${krDiff.diff_download.url_prefix}` : ""
                }
            }

            preloaddata = {
                metadata: pmetadatainfo,
                game: {full: pfg, diff: pdg},
                audio: {full: pfa, diff: pda}
            }
        }
    }

    return preloaddata;
}

generateManifest("hk4e_global").then(r => writeFileSync(gipath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("hkrpg_global").then(r => writeFileSync(hsrpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("nap_global").then(r => writeFileSync(zzzpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("bh3_global").then(r => writeFileSync(bhpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
//generateManifest("abc_global").then(r => writeFileSync(hnapath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
//generateManifest("hyg_global").then(r => writeFileSync(pppath, JSON.stringify(r, null, 2), {encoding: "utf8"}));