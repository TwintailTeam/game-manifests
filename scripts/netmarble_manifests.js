const {writeFileSync, readFileSync, existsSync} = require('fs');

let INDEX = {
    sevendeadlysinsgrandcross: {
        game: "https://apis.netmarble.com/cpplauncher/api/game/nanagb/builds?buildCode=A",
        launcher: "https://apis.netmarble.com/cpplauncher/api/games/nanagb",
        icon: "https://cdn2.steamgriddb.com/icon_thumb/434bad3ced4015a2e552a45aa38dc2a8.png"
    }
};

let sdshosts = ["pc.crashsight.wetest.net"];
let sdspath = `${__dirname}/generated/sdsgc_global.json`;
let sdsfps = ["120"];
let sdscompat = ["noxalia"];
let sdsminrunners = [];
let sdstricks = [];
let sdsgraphicsapi = [{value: "-force-d3d11", name: "DirectX 11"}, {value: "-force-d3d12", name: "DirectX 12"}];

async function queryIndex(biz) {
    let rsp = await fetch((biz === "sdsgc_global") ? `${INDEX.sevendeadlysinsgrandcross.game}` : ``, {
        method: "GET",
        headers: {"X-NM-LAUNCHER-OS": "Windows_NT", "X-NM-LAUNCHER-OS-VERSION": "10.0.19044", "X-NM-LAUNCHER-SER-TY": "nm", "X-NM-API-VER": "null", "X-NM-LAUNCHER-IGS": "",
            "X-NM-LAUNCHER-LANG": "EN_US", "X-NM-LAUNCHER-AK": "", "X-NM-LAUNCHER-CH": "ypWjRL2aNi", "X-NM-LAUNCHER-ARCH": "x64", "X-NM-LAUNCHER-VER": "1.3.2", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NetmarbleLauncher/1.3.2 Chrome/108.0.5359.215 Electron/22.3.8 Safari/537.36", "content-type": "application/json"}
    });
    if (rsp.status !== 200) return null;
    let r = await rsp.json();

    let rsp1 = await fetch((biz === "sdsgc_global") ? `${INDEX.sevendeadlysinsgrandcross.launcher}` : ``, {
        method: "GET",
        headers: {"X-NM-LAUNCHER-OS": "Windows_NT", "X-NM-LAUNCHER-OS-VERSION": "10.0.19044", "X-NM-LAUNCHER-SER-TY": "nm", "X-NM-API-VER": "null", "X-NM-LAUNCHER-IGS": "",
            "X-NM-LAUNCHER-LANG": "EN_US", "X-NM-LAUNCHER-AK": "", "X-NM-LAUNCHER-CH": "ypWjRL2aNi", "X-NM-LAUNCHER-ARCH": "x64", "X-NM-LAUNCHER-VER": "1.3.2", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) NetmarbleLauncher/1.3.2 Chrome/108.0.5359.215 Electron/22.3.8 Safari/537.36", "content-type": "application/json"}
    });
    if (rsp1.status !== 200) return null;
    let r1 = await rsp1.json();

    return {
        background_url: `${r1.data.mainBgImageUrl}`,
        background_video_url: ``,
        icon_url: (biz === "sdsgc_global") ? `${INDEX.sevendeadlysinsgrandcross.icon}` : ``,
        latest_version: r1.data.buildList[0].buildVersion,
        previous_version: ``,
        current_version: r.data.buildVersion,
        exe_file: "7dsgc.exe",
        resource_base: ``,
        latest_version_size: {compressed_size: r.data.buildFileSizeByte, decompressed_size: r.data.buildFileSizeByte},
        packages: r.data.fragmentList,
        patch: r.data.partialFileList,
    }
}

async function generateManifest(biz) {
    let index = await queryIndex(biz);
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url, game_live_background: index.background_video_url}
    let pkg = await formatPackages(index.packages, index.patch);

    let final = {};
    switch (biz) {
        case "sdsgc_global": {
            let metadatainfo = {versioned_name: `The Seven Deadly Sins: Grand Cross ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_FILE", game_hash: "",
                index_file: "",
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
                if (existsSync(sdspath)) {
                    let currentf = readFileSync(sdspath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== index.current_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "The Seven Deadly Sins: Grand Cross (Global)",
                biz: "sdsgc_global",
                latest_version: index.latest_version,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: sdshosts,
                extra: {
                    fps_unlock_options: sdsfps,
                    graphics_api_options: {
                        default: "-force-d3d11",
                        options: sdsgraphicsapi
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
                        proton_compat_config: sdscompat,
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
                        min_runner_versions: sdsminrunners,
                        winetricks_verbs: sdstricks
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

async function formatPackages(packages, patch) {
    let fg = [];
    let fa = [];
    let dg = [];
    let da = [];

    packages.forEach(p => {
       return fg.push({
           file_url: `${p.downloadUrl}`,
           compressed_size: `${p.fileSizeByte}`,
           decompressed_size: `${p.fileSizeByte}`,
           file_hash: `${p.fileHash}`,
           file_path: "",
           region_code: ""
       });
    });

    // Getting patch zips is possible just original_version grab is fucked so disable... will work fine same way aethergazer works
    /*if (patch && patch.length > 0) {
        patch.forEach(p => {
            p.fragmentList.forEach(f => {
                return dg.push({
                    file_url: `${f.downloadUrl}`,
                    compressed_size: `${f.fileSizeByte}`,
                    decompressed_size: `${f.fileSizeByte}`,
                    file_hash: `${f.fileHash}`,
                    file_path: "",
                    diff_type: "diff",
                    original_version: "",
                    delete_files: []
                });
            })
        });
    }*/

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

generateManifest("sdsgc_global").then(r => writeFileSync(sdspath, JSON.stringify(r, null, 2), {encoding: "utf8"}));