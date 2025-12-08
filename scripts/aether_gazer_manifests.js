const {writeFileSync, readFileSync, existsSync} = require('fs');

let BASICINFO_API = "https://us-api.yongshigame.com/game-website-server/pass/sdk/get_index_config?gameId=1";
let GAMESINFO_API = "https://us-api.yongshigame.com/game-website-server/pass/sdk/get_update_version?gameId=1";

let aghosts = ["pc.crashsight.wetest.net"];

let agfps = ["120"];
let agpath = `${__dirname}/generated/aethergazer_global.json`;

async function queryAgApis() {
    let rsp1 = await fetch(`${BASICINFO_API}`);
    let r1 = await rsp1.json();

    let rsp2 = await fetch(`${GAMESINFO_API}`);
    let r2 = await rsp2.json();

    if (r1.errorCode !== "0" || r2.errorCode !== "0") return null;

    let gp = r2.data.gameUpdateInfo;
    let pkgs = [{
        game_biz: "aethergazer_global",
        game_version: gp.currentVersion,
        full_game: [{
            file_url: gp.downloadUrl,
            compressed_size: `${gp.zipFileSize}`,
            decompressed_size: `${gp.unzipFileSize}`,
            file_hash: "",
            file_path: ""
        }],
        full_audio: [],
        res_list: "",
        diff_game: [],
        diff_audio: [],
        preload: []
    }];

    return {
        game_packages: pkgs,
        assets: [{
                game_biz: "aethergazer_global",
                background: r1.data.versionImage,
                icon: "https://aethergazer.com/favicon.ico",
            }]
    };
}

async function generateManifest(gameBiz) {
    let rsp = await queryAgApis();
    if (rsp === null) return null;

    let assets = rsp.assets.filter(e => e.game_biz === gameBiz)[0];
    let packages = rsp.game_packages.filter(e => e.game_biz === gameBiz)[0];
    let assetcfg = {game_icon: assets.icon, game_background: assets.background, game_live_background: ""};

    let final = {};
    switch (gameBiz) {
        case "aethergazer_global": {
            let metadatainfo = {versioned_name: `AetherGazer ${packages.game_version} (Global)`, version: packages.game_version, download_mode: `DOWNLOAD_MODE_FILE`, game_hash: "",
                index_file: "",
                res_list_url: ``,
                diff_list_url: {
                    game: "",
                    en_us: "",
                    zh_cn: "",
                    ja_jp: "",
                    ko_kr: "",
                }
            }
            let versioninfo = {
                metadata: metadatainfo,
                assets: assetcfg,
                game: {full: packages.full_game, diff: packages.diff_game},
                audio: {full: packages.full_audio, diff: packages.diff_audio}
            };

            let gameversions = [];
            // append version
            if (process.argv[2] === "append") {
                if (existsSync(agpath)) {
                    let currentf = readFileSync(agpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== packages.game_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "AetherGazer (Global)",
                biz: "aethergazer_global",
                latest_version: packages.game_version,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: "", exe_filename: "AetherGazer.exe", installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: ""},
                assets: assetcfg,
                telemetry_hosts: aghosts,
                extra: {
                    fps_unlock_options: agfps,
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: false
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
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
                    preload: {}
                }
            };
        }
        break;
    }
    return final;
}

generateManifest("aethergazer_global").then(r => writeFileSync(agpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));