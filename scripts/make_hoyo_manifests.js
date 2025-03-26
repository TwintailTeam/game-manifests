const {writeFileSync, readFileSync, existsSync} = require('fs');

let API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGameComboInfo?channel=0&game_ids[]=4ziysqXOQ8&game_ids[]=U5hbdsT9W7&game_ids[]=gopR6Cufr3&game_ids[]=5TIVvvcwtM&launcher_id=VYTpXlbWo8&sub_channel=0";
let BASICINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=VYTpXlbWo8&language=en-us&game_id=";
let GAMESINFO_API = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGames?launcher_id=VYTpXlbWo8&language=en-us";

let gihosts = [];
let hsrhosts = [];
let zzzhosts = [];
let bhhosts = [];

let gipath = `${__dirname}/generated/hk4e_global.json`;
let hsrpath = `${__dirname}/generated/hkrpg_global.json`;
let zzzpath = `${__dirname}/generated/nap_global.json`;
let bhpath = `${__dirname}/generated/bh3_global.json`;

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
            download_mode: i.default_download_mode
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

    let gp = r.data.game_packages;
    let pkgs = [];

    gp.forEach((i) => {
       pkgs.push({
           game_biz: i.game.biz,
           game_version: i.main.major.version,
           full_game: i.main.major.game_pkgs,
           full_audio: i.main.major.audio_pkgs,
           res_list: i.main.major.res_list_url,
           diffs: i.main.patches,
           preload: i.pre_download
       })
    });

    return {
        game_packages: pkgs,
        launch_configs: lce,
        assets: bgs
    };
}

async function generateManifest(gameBiz) {
    let rsp = await queryHoyoPlayApis();
    if (rsp === null) return null;

    let assets = rsp.assets.filter(e => e.game_biz === gameBiz)[0];
    let config = rsp.launch_configs.filter(e => e.game_biz === gameBiz)[0];
    let packages = rsp.game_packages.filter(e => e.game_biz === gameBiz)[0];

    let assetcfg = {game_icon: assets.icon, game_background: assets.background}
    let pkg = formatPackages(packages);

    let final = {};
    switch (gameBiz) {
        case "hk4e_global": {
            let metadatainfo = {versioned_name: `GenshinImpact ${packages.game_version} (Global)`, version: packages.game_version, game_hash: ""};
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
                        if (v.metadata.version !== packages.game_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "GenshinImpact (Global)",
                biz: "hk4e_global",
                latest_version: packages.game_version,
                game_versions: gameversions,
                paths: {exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: gihosts,
                extra: {
                    switches: {
                        fps_unlocker: true,
                        jadeite: false,
                        xxmi: true
                    },
                    preload: formatPreload(packages, "GenshinImpact")
                }
            };
        }
        break;
        case "hkrpg_global": {
            let metadatainfo = {versioned_name: `Honkai: StarRail ${packages.game_version} (Global)`, version: packages.game_version, game_hash: ""}
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
                        if (v.metadata.version !== packages.game_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Honkai: StarRail (Global)",
                biz: "hkrpg_global",
                latest_version: packages.game_version,
                game_versions: gameversions,
                paths: {exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "data_dir"},
                assets: assetcfg,
                telemetry_hosts: hsrhosts,
                extra: {
                    switches: {
                        fps_unlocker: false,
                        jadeite: true,
                        xxmi: true
                    },
                    preload: formatPreload(packages, "Honkai: StarRail")
                }
            };
        }
        break;
        case "nap_global": {
            let metadatainfo = {versioned_name: `ZenlessZoneZero ${packages.game_version} (Global)`, version: packages.game_version, game_hash: ""}
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
                        if (v.metadata.version !== packages.game_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "ZenlessZoneZero (Global)",
                biz: "nap_global",
                latest_version: packages.game_version,
                game_versions: gameversions,
                paths: {exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: zzzhosts,
                extra: {
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: true
                    },
                    preload: formatPreload(packages, "ZenlessZoneZero")
                }
            };
        }
        break;
        case "bh3_global": {
            let metadatainfo = {versioned_name: `HonkaiImpact 3rd ${packages.game_version} (Global)`, version: packages.game_version, game_hash: ""}
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
                        if (v.metadata.version !== packages.game_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "HonkaiImpact 3rd (Global)",
                biz: "bh3_global",
                latest_version: packages.game_version,
                game_versions: gameversions,
                paths: {exe_filename: config.exe_filename, installation_dir: config.installation_dir, screenshot_dir: config.screenshot_dir, screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: bhhosts,
                extra: {
                    switches: {
                        fps_unlocker: false,
                        jadeite: true,
                        xxmi: true
                    },
                    preload: formatPreload(packages, "HonkaiImpact 3rd")
                }
            };
        }
        break;
    }
    return final;
}

function formatPackages(packages) {
    let fg = [];
    packages.full_game.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            file_path: ""
        });
    });

    let fa = [];
    packages.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });

    let dg = [];
    packages.diffs.forEach(e => {
        e.game_pkgs.forEach(e2 => {
            return dg.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version,
                delete_files: []
            });
        })
    });

    let da = [];
    packages.diffs.forEach(e => {
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
    });

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

function formatPreload(pkgs, name) {
    let preloaddata = {};

    if (pkgs.preload.major !== null) {
        let pfg = [];
        pkgs.preload.major.game_pkgs.forEach(e => {
            return pfg.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5
            });
        });

        let pfa = [];
        pkgs.preload.major.audio_pkgs.forEach(e => {
            return pfa.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5,
                language: e.language
            });
        });

        let pdg = [];
        pkgs.preload.patches.forEach(e => {
            e.game_pkgs.forEach(e2 => {
                return pdg.push({
                    file_url: e2.url,
                    compressed_size: e2.size,
                    decompressed_size: e2.decompressed_size,
                    file_hash: e2.md5,
                    diff_type: "hdiff",
                    original_version: e.version
                });
            })
        });

        let pda = [];
        pkgs.preload.patches.forEach(e => {
            e.audio_pkgs.forEach(e2 => {
                return pda.push({
                    file_url: e2.url,
                    compressed_size: e2.size,
                    decompressed_size: e2.decompressed_size,
                    file_hash: e2.md5,
                    diff_type: "ldiff",
                    original_version: e.version,
                    language: e2.language
                });
            })
        });

        let pmetadatainfo = {
            versioned_name: `${name} ${pkgs.preload.major.version} Preload (Global)`,
            version: pkgs.preload.major.version,
            game_hash: "",
        }

        preloaddata = {
            metadata: pmetadatainfo,
            game: {full: pfg, diff: pdg},
            audio: {full: pfa, diff: pda}
        }
    }

    return preloaddata;
}

generateManifest("hk4e_global").then(r => writeFileSync(gipath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("hkrpg_global").then(r => writeFileSync(hsrpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("nap_global").then(r => writeFileSync(zzzpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("bh3_global").then(r => writeFileSync(bhpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));