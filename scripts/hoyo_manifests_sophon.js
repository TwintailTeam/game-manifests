const {writeFileSync, readFileSync, existsSync} = require('fs');

let API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGameComboInfo?channel=0&game_ids[]=4ziysqXOQ8&game_ids[]=U5hbdsT9W7&game_ids[]=gopR6Cufr3&game_ids[]=5TIVvvcwtM&launcher_id=VYTpXlbWo8&sub_channel=0";
let BASICINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=VYTpXlbWo8&language=en-us&game_id=";
let GAMESINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGames?launcher_id=VYTpXlbWo8&language=en-us";

let gihosts = ["log-upload-os.hoyoverse.com", "overseauspider.yuanshen.com", "osuspider.yuanshen.com", "ys-log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com"];
let hsrhosts = ["log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com"];
let zzzhosts = ["apm-log-upload-os.hoyoverse.com", "zzz-log-upload-os.hoyoverse.com", "log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com"];
let bhhosts = ["log-upload-os.hoyoverse.com", "dump.gamesafe.qq.com", "log-upload-os.hoyoverse.com", "sg-public-data-api.hoyoverse.com"];

let gifps = ["120", "144", "165", "180", "240"];
let hsrfps = ["120"];
let zzzfps = ["120", "144"];
let bh3fps = ["120"];

let gipath = `${__dirname}/generated/hk4e_global.json`;
let hsrpath = `${__dirname}/generated_tests/hkrpg_global.json`;
let zzzpath = `${__dirname}/generated/nap_global.json`;
let bhpath = `${__dirname}/generated_tests/bh3_global.json`;

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
            icon: gii.filter(e => e.biz === i.game.biz)[0].display.icon.url,
        });
    });

    let gb = r.data.game_branches;
    let br = [];
    gb.forEach((i) => {
        br.push({
            game_biz: i.game.biz,
            game_id: i.game.id,
            main: i.main,
            preload: i.pre_download
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
    let branches = rsp.branches.filter(e => e.game_biz === gameBiz)[0];

    let assetcfg = {game_icon: assets.icon, game_background: assets.background}
    let pkg = await formatPackages(branches);

    let final = {};
    switch (gameBiz) {
        case "hk4e_global": {
            let metadatainfo = {versioned_name: `GenshinImpact ${branches.main.tag} (Global)`, version: branches.main.tag, download_mode: `${config.download_mode}`, game_hash: "",
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
                        if (v.metadata.version !== branches.main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "GenshinImpact (Global)",
                biz: "hk4e_global",
                latest_version: branches.main.tag,
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
                    preload: await formatPreload(branches, "GenshinImpact")
                }
            };
        }
        break;
        case "hkrpg_global": {
            let metadatainfo = {versioned_name: `Honkai: StarRail ${branches.main.tag} (Global)`, version: branches.main.tag, download_mode: `${config.download_mode}`, game_hash: "",
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
                if (existsSync(gipath)) {
                    let currentf = readFileSync(hsrpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches.main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Honkai: StarRail (Global)",
                biz: "hkrpg_global",
                latest_version: branches.main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "data_dir"},
                assets: assetcfg,
                telemetry_hosts: hsrhosts,
                extra: {
                    fps_unlock_options: hsrfps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: true,
                        xxmi: true
                    },
                    preload: await formatPreload(branches, "Honkai: StarRail")
                }
            };
        }
        break;
        case "nap_global": {
            let metadatainfo = {versioned_name: `ZenlessZoneZero ${branches.main.tag} (Global)`, version: branches.main.tag, download_mode: `${config.download_mode}`, game_hash: "",
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
                if (existsSync(gipath)) {
                    let currentf = readFileSync(zzzpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches.main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "ZenlessZoneZero (Global)",
                biz: "nap_global",
                latest_version: branches.main.tag,
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
                    preload: await formatPreload(branches, "ZenlessZoneZero")
                }
            };
        }
        break;
        case "bh3_global": {
            let metadatainfo = {versioned_name: `HonkaiImpact 3rd ${branches.main.tag} (Global)`, version: branches.main.tag, download_mode: `${config.download_mode}`, game_hash: "",
                index_file: "",
                res_list_url: "",
                diff_list_url: {
                    game: "",
                    en_us: "",
                    zh_cn: "",
                    ja_jp: "",
                    ko_kr: ""
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
                if (existsSync(gipath)) {
                    let currentf = readFileSync(bhpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== branches.main.tag) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "HonkaiImpact 3rd (Global)",
                biz: "bh3_global",
                latest_version: branches.main.tag,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: config.audio_pkg_res_dir, exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: bhhosts,
                extra: {
                    fps_unlock_options: bh3fps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: true,
                        xxmi: true
                    },
                    preload: await formatPreload(branches, "HonkaiImpact 3rd")
                }
            };
        }
        break;
    }
    return final;
}

async function formatPackages(packages) {
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

        let gameDiff = d1.manifests.filter(e => e.matching_field === "game")[0];
        let enDiff = d1.manifests.filter(e => e.matching_field === "en-us")[0];
        let cnDiff = d1.manifests.filter(e => e.matching_field === "zh-cn")[0];
        let krDiff = d1.manifests.filter(e => e.matching_field === "ko-kr")[0];
        let jpDiff = d1.manifests.filter(e => e.matching_field === "ja-jp")[0];

        fg.push({
            file_url: `${game.manifest_download.url_prefix}/${game.manifest.id}`,
            compressed_size: `${game.stats.compressed_size}`,
            decompressed_size: `${game.stats.uncompressed_size}`,
            file_hash: game.manifest.checksum,
            file_path: ""
        });

        fa.push({
            file_url: `${en.manifest_download.url_prefix}/${en.manifest.id}`,
            compressed_size: `${en.stats.compressed_size}`,
            decompressed_size: `${en.stats.uncompressed_size}`,
            file_hash: en.manifest.checksum,
            language: en.matching_field
        });

        packages.main.diff_tags.forEach(v => {
            dg.push({
                file_url: `${gameDiff.manifest_download.url_prefix}/${gameDiff.manifest.id}`,
                compressed_size: `${gameDiff.stats[v].compressed_size}`,
                decompressed_size: `${gameDiff.stats[v].uncompressed_size}`,
                file_hash: `${gameDiff.manifest.checksum}`,
                diff_type: "ldiff",
                original_version: v,
                delete_files: []
            });

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

        });

        fa.push({
            file_url: `${cn.manifest_download.url_prefix}/${cn.manifest.id}`,
            compressed_size: `${cn.stats.compressed_size}`,
            decompressed_size: `${cn.stats.uncompressed_size}`,
            file_hash: cn.manifest.checksum,
            language: cn.matching_field
        });

        fa.push({
            file_url: `${kr.manifest_download.url_prefix}/${kr.manifest.id}`,
            compressed_size: `${kr.stats.compressed_size}`,
            decompressed_size: `${kr.stats.uncompressed_size}`,
            file_hash: kr.manifest.checksum,
            language: kr.matching_field
        });

        fa.push({
            file_url: `${jp.manifest_download.url_prefix}/${jp.manifest.id}`,
            compressed_size: `${jp.stats.compressed_size}`,
            decompressed_size: `${jp.stats.uncompressed_size}`,
            file_hash: jp.manifest.checksum,
            language: jp.matching_field
        });

        return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da,
            game_diff: gameDiff.diff_download.url_prefix,
            en_diff: enDiff.diff_download.url_prefix,
            cn_diff: cnDiff.diff_download.url_prefix,
            jp_diff: jpDiff.diff_download.url_prefix,
            kr_diff: krDiff.diff_download.url_prefix,
            chunk_base: game.chunk_download.url_prefix
        };
    }
}

async function formatPreload(pkgs, name) {
    let preloaddata = {};

    if (pkgs.preload !== null) {
        let manifest = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getBuild?branch=${pkgs.preload.branch}&package_id=${pkgs.preload.package_id}&password=${pkgs.preload.password}&plat_app=${pkgs.game_id}`;
        let rsp = await fetch(`${manifest}`);
        let r = await rsp.json();

        let diff = `https://sg-public-api.hoyoverse.com/downloader/sophon_chunk/api/getPatchBuild?branch=${packages.preload.branch}&package_id=${packages.preload.package_id}&password=${packages.preload.password}&plat_app=${packages.game_id}`;
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

            let gameDiff = d1.manifests.filter(e => e.matching_field === "game")[0];
            let enDiff = d1.manifests.filter(e => e.matching_field === "en-us")[0];
            let cnDiff = d1.manifests.filter(e => e.matching_field === "zh-cn")[0];
            let krDiff = d1.manifests.filter(e => e.matching_field === "ko-kr")[0];
            let jpDiff = d1.manifests.filter(e => e.matching_field === "ja-jp")[0];

            pfg.push({
                file_url: `${game.manifest_download.url_prefix}/${game.manifest.id}`,
                compressed_size: `${game.stats.compressed_size}`,
                decompressed_size: `${game.stats.uncompressed_size}`,
                file_hash: game.manifest.checksum,
                file_path: ""
            });

            pkgs.preload.diff_tags.forEach(v => {
                pdg.push({
                    file_url: `${gameDiff.manifest_download.url_prefix}/${gameDiff.manifest.id}`,
                    compressed_size: `${gameDiff.stats[v].compressed_size}`,
                    decompressed_size: `${gameDiff.stats[v].uncompressed_size}`,
                    file_hash: `${gameDiff.manifest.checksum}`,
                    diff_type: "ldiff",
                    original_version: v,
                    delete_files: []
                });

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

            })

            pfa.push({
                file_url: `${en.manifest_download.url_prefix}/${en.manifest.id}`,
                compressed_size: `${en.stats.compressed_size}`,
                decompressed_size: `${en.stats.uncompressed_size}`,
                file_hash: en.manifest.checksum,
                language: en.matching_field
            });

            pfa.push({
                file_url: `${cn.manifest_download.url_prefix}/${cn.manifest.id}`,
                compressed_size: `${cn.stats.compressed_size}`,
                decompressed_size: `${cn.stats.uncompressed_size}`,
                file_hash: cn.manifest.checksum,
                language: cn.matching_field
            });

            pfa.push({
                file_url: `${kr.manifest_download.url_prefix}/${kr.manifest.id}`,
                compressed_size: `${kr.stats.compressed_size}`,
                decompressed_size: `${kr.stats.uncompressed_size}`,
                file_hash: kr.manifest.checksum,
                language: kr.matching_field
            });

            pfa.push({
                file_url: `${jp.manifest_download.url_prefix}/${jp.manifest.id}`,
                compressed_size: `${jp.stats.compressed_size}`,
                decompressed_size: `${jp.stats.uncompressed_size}`,
                file_hash: jp.manifest.checksum,
                language: jp.matching_field
            });

            let pmetadatainfo = {
                versioned_name: `${name} ${pkgs.preload.tag} Preload (Global)`,
                version: pkgs.preload.tag,
                download_mode: "DOWNLOAD_MODE_CHUNK",
                game_hash: "",
                index_file: "",
                res_list_url: `${game.chunk_download.url_prefix}`,
                diff_list_url: {
                    game: `${gameDiff.diff_download.url_prefix}`,
                    en_us: `${enDiff.diff_download.url_prefix}`,
                    zh_cn: `${cnDiff.diff_download.url_prefix}`,
                    ja_jp: `${jpDiff.diff_download.url_prefix}`,
                    ko_kr: `${krDiff.diff_download.url_prefix}`
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
//generateManifest("bh3_global").then(r => writeFileSync(bhpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));