const {writeFileSync, readFileSync, existsSync} = require('fs');

let INDEX = {
    endfield: {
        game: "https://launcher.gryphline.com/api/game/get_latest?appcode=YDUTE5gscDZ229CW&channel=6&sub_channel=6",
        launcher: "https://launcher.gryphline.com/api/proxy/web/batch_proxy",
        icon: "https://cdn2.steamgriddb.com/icon_thumb/ba8df6f0cd805cf14c67bace58fb0060.png"
    }
};

let efhosts = ["pc.crashsight.wetest.net"];
let efpath = `${__dirname}/generated/endfield_global.json`;
let effps = ["120"];
let efcompat = ["noxalia"];
let efminrunners = [];
let eftricks = [];

async function queryIndex(biz) {
    let rsp = await fetch((biz === "endfield_global") ? `${INDEX.endfield.game}` : ``);
    if (rsp.status !== 200) return null;
    let r = await rsp.json();

    let rsp1 = await fetch((biz === "endfield_global") ? `${INDEX.endfield.launcher}` : ``, {
        method: "POST",
        headers: {"authority": "launcher.gryphline.com", "user-agent": "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) QtWebEngine/5.15.8 Chrome/87.0.4280.144 Safari/537.36", "content-type": "application/json"},
        body: JSON.stringify({proxy_reqs: [
            {kind: "get_sidebar", get_sidebar_req: {appcode: "YDUTE5gscDZ229CW", language: "en-us", channel: "6", sub_channel: "6", platform: "Windows", source: "launcher"}},
            {kind: "get_single_ent", get_single_ent_req: {appcode: "YDUTE5gscDZ229CW", language: "en-us", channel: "6", sub_channel: "6", platform: "Windows", source: "launcher"}},
            {kind: "get_main_bg_image", get_main_bg_image_req: {appcode: "YDUTE5gscDZ229CW", language: "en-us", channel: "6", sub_channel: "6", platform: "Windows", source: "launcher"}},
            {kind: "get_banner", get_banner_req: {appcode: "YDUTE5gscDZ229CW", language: "en-us", channel: "6", sub_channel: "6", platform: "Windows", source: "launcher"}},
            {kind: "get_announcement", get_announcement_req: {appcode: "YDUTE5gscDZ229CW", language: "en-us", channel: "6", sub_channel: "6", platform: "Windows", source: "launcher"}}
        ]})
    });
    if (rsp1.status !== 200) return null;
    let r1 = await rsp1.json();

    let preload = {};
    /*if (r.hasOwnProperty("predownload")) {
        preload = {
            resource_base: `${cdnbase}/${r.predownload.resourcesBasePath}`,
            resources_list: `${cdnbase}/${r.predownload.resources}`,
            version: r.predownload.version,
            previous_version: "",
            current_version: r.predownload.version,
            index_file: `${cdnbase}/${r.predownload.config.indexFile}`,
            version_size: {compressed_size: r.predownload.config.size, decompressed_size: r.predownload.config.unCompressSize},
            patch_config: r.predownload.config.patchConfig
        };
    }*/

    let bg = r1.proxy_rsps.find(e => e.kind === "get_main_bg_image");
    return {
        background_url: `${bg.get_main_bg_image_rsp.main_bg_image.url}`,
        background_video_url: `${bg.get_main_bg_image_rsp.main_bg_image.video_url}`,
        icon_url: (biz === "endfield_global") ? `${INDEX.endfield.icon}` : ``,
        latest_version: r.version,
        previous_version: `${r.request_version}`,
        current_version: r.version,
        exe_file: "Endfield.exe",
        resource_base: `${r.pkg.file_path}`,
        latest_version_size: {compressed_size: r.pkg.total_size, decompressed_size: r.pkg.total_size},
        preload: preload,
        patch: r.patch,
        packages: r.pkg.packs
    }
}

async function generateManifest(biz) {
    let index = await queryIndex(biz);
    if (index === null) return null;

    let assetcfg = {game_icon: index.icon_url, game_background: index.background_url, game_live_background: index.background_video_url}
    let pkg = await formatPackages(index.packages);

    let final = {};
    switch (biz) {
        case "endfield_global": {
            let metadatainfo = {versioned_name: `Arknights Endfield ${index.current_version} (Global)`, version: index.current_version, download_mode: "DOWNLOAD_MODE_FILE", game_hash: "",
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
                if (existsSync(efpath)) {
                    let currentf = readFileSync(efpath);
                    let data = JSON.parse(currentf);
                    gameversions.push(versioninfo);

                    data.game_versions.forEach(v => {
                        if (v.metadata.version !== index.current_version) {gameversions.push(v);}
                    });
                } else {gameversions.push(versioninfo);}
            } else {gameversions.push(versioninfo);}

            final = {
                version: 1,
                display_name: "Arknights Endfield (Global)",
                biz: "endfield_global",
                latest_version: index.latest_version,
                game_versions: gameversions,
                paths: {audio_pkg_res_dir: "", exe_filename: index.exe_file, installation_dir: "", screenshot_dir: "", screenshot_dir_relative_to: "game_dir"},
                assets: assetcfg,
                telemetry_hosts: efhosts,
                extra: {
                    fps_unlock_options: effps,
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
                        proton_compat_config: efcompat,
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
                        min_runner_versions: efminrunners,
                        winetricks_verbs: eftricks
                    },
                    steam_import_config: {
                        enabled: false,
                        steam_appid_txt: "",
                        steam_api_dll: ""
                    },
                    preload: {}//await formatPreload(biz, index.preload, "Arknights Endfield")
                }
            };
        }
        break;
    }
    return final;
}

async function formatPackages(packages) {
    let fg = [];
    let fa = [];
    let dg = [];
    let da = [];

    packages.forEach(p => {
       return fg.push({
           file_url: `${p.url}`,
           compressed_size: `${p.package_size}`,
           decompressed_size: `${p.package_size}`,
           file_hash: `${p.md5}`,
           file_path: "",
           region_code: ""
       });
    });

    // TODO: diff packages when available

    return {full_game: fg, full_audio: fa, diff_game: dg, diff_audio: da};
}

/*async function formatPreload(biz, pkgs, name) {
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
            download_mode: "DOWNLOAD_MODE_FILE",
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
}*/

generateManifest("endfield_global").then(r => writeFileSync(efpath, JSON.stringify(r, null, 2), {encoding: "utf8"}));