const {writeFileSync, readFileSync, existsSync} = require('fs');
const {createHash} = require('crypto');

let INDEX = {
    stellasora: {
        api: "https://api-launcher-en.yo-star.com",
        game_tag: "StellaSora_EN",
        launcher_version: "1.8.1",
        salt: "DE7108E9B2842FD460F4777702727869",
        icon: "https://cdn2.steamgriddb.com/icon_thumb/13ed13917628a36d13badebfff372ed6.png"
    },
    arknights: {
        api: "https://api-launcher-en.yo-star.com",
        game_tag: "Arknights_EN",
        launcher_version: "1.8.1",
        salt: "DE7108E9B2842FD460F4777702727869",
        icon: "https://cdn2.steamgriddb.com/icon_thumb/7298332f04ac004a0ca44cc69ecf6f6b.png"
    }
};

let useragent = "axios/1.5.0";

let sshosts = ["pc.crashsight.wetest.net"];
let sspath = `${__dirname}/generated/stellasora_global.json`;
let ssfps = ["120"];
let sscompat = ["noxalia"];
let ssminrunners = [];
let sstricks = [];
let ssgraphicsapi = [{value: "-force-d3d11", name: "DirectX 11"}, {value: "-force-d3d12", name: "DirectX 12"}];

let akhosts = ["pc.crashsight.wetest.net"];
let akpath = `${__dirname}/generated/arknights_global.json`;
let akfps = ["120"];
let akcompat = ["noxalia"];
let akminrunners = [];
let aktricks = [];
let akgraphicsapi = [{value: "-force-d3d11", name: "DirectX 11"}, {value: "-force-d3d12", name: "DirectX 12"}];

// md5(JSON.stringify(head) + body + salt), key order of head is part of the signature
function authHeader(game, body) {
    let head = {game_tag: game.game_tag, time: Math.floor(Date.now() / 1000), version: game.launcher_version};
    let sign = createHash("md5").update(`${JSON.stringify(head)}${body ?? ""}${game.salt}`).digest("hex");
    return JSON.stringify({head: head, sign: sign});
}

async function queryApi(game, path, params) {
    let rsp = await fetch(`${game.api}${path}${(params) ? `?${new URLSearchParams(params)}` : ``}`, {
        method: "GET",
        headers: {"Authorization": authHeader(game, ""), "content-type": "application/json;charset=UTF-8", "user-agent": useragent}
    });
    if (rsp.status !== 200) return null;
    let r = await rsp.json();
    return (r.code === 200) ? r.data : null;
}

async function queryIndex(biz) {
    let game = (biz === "arknights_global") ? INDEX.arknights : INDEX.stellasora;

    let r = await queryApi(game, "/api/launcher/game/config");
    if (r === null) return null;

    let r1 = await queryApi(game, "/api/launcher/base/config");
    if (r1 === null) return null;

    let r2 = await queryApi(game, "/api/launcher/advanced/game/download/cdn");
    if (r2 === null) return null;

    let r3 = await queryApi(game, "/api/launcher/game/config/json", {version: r.game_latest_version, file_path: r.game_latest_file_path});
    if (r3 === null) return null;

    let rsp = await fetch(`${r3.url}`, {method: "GET", headers: {"cache-control": "no-cache", "user-agent": useragent}});
    if (rsp.status !== 200) return null;
    let r4 = await rsp.json();
    let size = r4.file.reduce((a, e) => a + Number(e.size), 0);

    return {
        background_url: `${r1.launcher_background_img}`,
        background_video_url: ``,
        icon_url: (biz === "arknights_global") ? `${INDEX.arknights.icon}` : `${INDEX.stellasora.icon}`,
        latest_version: r.game_latest_version,
        previous_version: ``,
        current_version: r.game_latest_version,
        exe_file: `${r.game_start_exe_name}.exe`,
        index_file: `${r3.url}`,
        resource_base: `${r2.primary_cdn}${r4.source}`,
        latest_version_size: {compressed_size: size, decompressed_size: size}
    }
}

async function generateManifest(biz) {
    let index = await queryIndex(biz);
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url, game_live_background: index.background_video_url}
    let pkg = await formatPackages(index.index_file, index.latest_version_size);

    let final = {};
    switch (biz) {
        case "stellasora_global": {
            let metadatainfo = {versioned_name: `StellaSora ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_RAW", game_hash: "",
                index_file: `${index.index_file}`,
                res_list_url: `${index.resource_base}`,
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
                if (existsSync(sspath)) {
                    let currentf = readFileSync(sspath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== index.current_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "StellaSora (Global)",
                biz: "stellasora_global",
                latest_version: index.latest_version,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: sshosts,
                extra: {
                    fps_unlock_options: ssfps,
                    graphics_api_options: {
                        default: "-force-d3d11",
                        options: ssgraphicsapi
                    },
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: false,
                        graphics_api: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: sscompat,
                        override_runner: {
                            linux: {
                                enabled: false,
                                runner_version: ""
                            },
                            macos: {
                                enabled: false,
                                runner_version: ""
                            }
                        },
                        min_runner_versions: ssminrunners,
                        winetricks_verbs: sstricks
                    },
                    steam_import_config: {
                        enabled: false,
                        steam_appid_txt: "",
                        steam_api_dll: ""
                    },
                    preload: {}
                }
            };
        }
        break;
        case "arknights_global": {
            let metadatainfo = {versioned_name: `Arknights ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_RAW", game_hash: "",
                index_file: `${index.index_file}`,
                res_list_url: `${index.resource_base}`,
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
                if (existsSync(akpath)) {
                    let currentf = readFileSync(akpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== index.current_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Arknights (Global)",
                biz: "arknights_global",
                latest_version: index.latest_version,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: akhosts,
                extra: {
                    fps_unlock_options: akfps,
                    graphics_api_options: {
                        default: "-force-d3d11",
                        options: akgraphicsapi
                    },
                    switches: {
                        fps_unlocker: false,
                        jadeite: false,
                        xxmi: false,
                        graphics_api: true
                    },
                    compat_overrides: {
                        install_to_prefix: false,
                        disable_protonfixes: true,
                        protonfixes_id: "",
                        protonfixes_store: "",
                        stub_wintrust: false,
                        block_first_req: false,
                        proton_compat_config: akcompat,
                        override_runner: {
                            linux: {
                                enabled: false,
                                runner_version: ""
                            },
                            macos: {
                                enabled: false,
                                runner_version: ""
                            }
                        },
                        min_runner_versions: akminrunners,
                        winetricks_verbs: aktricks
                    },
                    steam_import_config: {
                        enabled: false,
                        steam_appid_txt: "",
                        steam_api_dll: ""
                    },
                    preload: {}
                }
            };
        }
        break;
    }
    return final;
}

async function formatPackages(manifest, sizes) {
    let fg = [];
    let fa = [];
    let dg = [];
    let da = [];

    fg.push({
        file_url: `${manifest}`,
        compressed_size: `${sizes.compressed_size}`,
        decompressed_size: `${sizes.decompressed_size}`,
        file_hash: "",
        file_path: "",
        region_code: ""
    });

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

generateManifest("stellasora_global").then(r => writeFileSync(sspath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
generateManifest("arknights_global").then(r => writeFileSync(akpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));
