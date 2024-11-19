const {writeFileSync, readFileSync, existsSync} = require('fs');

let basicinfo = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=VYTpXlbWo8&language=en-us&game_id=";
let gamesinfo = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGames?launcher_id=VYTpXlbWo8&language=en-us";
let gamepackages = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGamePackages?game_ids[]=4ziysqXOQ8&game_ids[]=U5hbdsT9W7&game_ids[]=gopR6Cufr3&game_ids[]=5TIVvvcwtM&launcher_id=VYTpXlbWo8";
let gameconfigs = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGameConfigs?launcher_id=VYTpXlbWo8&game_ids%5B%5D=U5hbdsT9W7&game_ids%5B%5D=4ziysqXOQ8&game_ids%5B%5D=gopR6Cufr3&game_ids%5B%5D=5TIVvvcwtM";

let gihosts = [];
let hsrhosts = [];
let zzzhosts = [];
let bhhosts = [];

let gipath = "./generated/hk4e_global.json";
let hsrpath = "./generated/hkrpg_global.json";
let zzzpath = "./generated/nap_global.json";
let bhpath = "./generated/bh3_global.json";

async function parseBasicInfo() {
   let rsp = await fetch(`${basicinfo}`);
   let r = await rsp.json();

    if (r.retcode === 0) {
        let binfo = r.data.game_info_list;

        let gi = binfo.find(i => i.game.biz === "hk4e_global");
        let hsr = binfo.find(i => i.game.biz === "hkrpg_global");
        let zzz = binfo.find(i => i.game.biz === "nap_global");
        let hi = binfo.find(i => i.game.biz === "bh3_global");

        let giobj = {
            biz: gi.game.biz,
            background: gi.backgrounds[0].background.url,
        };

        let hsrobj = {
            biz: hsr.game.biz,
            background: hsr.backgrounds[0].background.url
        };

        let zzzobj = {
            biz: zzz.game.biz,
            background: zzz.backgrounds[0].background.url
        };

        let hiobj = {
            biz: hi.game.biz,
            background: hi.backgrounds[0].background.url
        };

        let gistr = JSON.stringify(giobj);
        let hsrstr = JSON.stringify(hsrobj);
        let zzzstr = JSON.stringify(zzzobj);
        let histr = JSON.stringify(hiobj);

        return JSON.parse(`{"games": [${gistr}, ${hsrstr}, ${zzzstr}, ${histr}]}`);
    } else {
        console.error("Got wrong retcode:" + r.retcode);
    }
}

async function parseGameConfigs() {
    let rsp = await fetch(`${gameconfigs}`);
    let r = await rsp.json();

    if (r.retcode === 0) {
        let binfo = r.data.launch_configs;

        let gi = binfo.find(i => i.game.biz === "hk4e_global");
        let hsr = binfo.find(i => i.game.biz === "hkrpg_global");
        let zzz = binfo.find(i => i.game.biz === "nap_global");
        let hi = binfo.find(i => i.game.biz === "bh3_global");

        let giobj = {
            biz: gi.game.biz,
            exe_filename: gi.exe_file_name,
            installation_dir: gi.installation_dir,
            screenshot_dir: gi.game_screenshot_dir
        };

        let hsrobj = {
            biz: hsr.game.biz,
            exe_filename: hsr.exe_file_name,
            installation_dir: hsr.installation_dir,
            screenshot_dir: hsr.game_screenshot_dir
        };

        let zzzobj = {
            biz: zzz.game.biz,
            exe_filename: zzz.exe_file_name,
            installation_dir: zzz.installation_dir,
            screenshot_dir: zzz.game_screenshot_dir
        };

        let hiobj = {
            biz: hi.game.biz,
            exe_filename: hi.exe_file_name,
            installation_dir: hi.installation_dir,
            screenshot_dir: hi.game_screenshot_dir
        };

        let gistr = JSON.stringify(giobj);
        let hsrstr = JSON.stringify(hsrobj);
        let zzzstr = JSON.stringify(zzzobj);
        let histr = JSON.stringify(hiobj);

        return JSON.parse(`{"games": [${gistr}, ${hsrstr}, ${zzzstr}, ${histr}]}`);
    } else {
        console.error("Got wrong retcode:" + r.retcode);
    }
}

async function parseGamesInfo() {
    let rsp = await fetch(`${gamesinfo}`);
    let r = await rsp.json();

    if (r.retcode === 0) {
        let binfo = r.data.games;

        let gi = binfo.find(i => i.biz === "hk4e_global");
        let hsr = binfo.find(i => i.biz === "hkrpg_global");
        let zzz = binfo.find(i => i.biz === "nap_global");
        let hi = binfo.find(i => i.biz === "bh3_global");

        let giobj = {
            biz: gi.biz,
            icon: gi.display.icon.url,
            background: gi.display.background.url,
            logo: gi.display.logo.url,
            status: gi.display_status,
        };

        let hsrobj = {
            biz: hsr.biz,
            icon: hsr.display.icon.url,
            background: hsr.display.background.url,
            logo: hsr.display.logo.url,
            status: hsr.display_status
        };

        let zzzobj = {
            biz: zzz.biz,
            icon: zzz.display.icon.url,
            background: zzz.display.background.url,
            logo: zzz.display.logo.url,
            status: zzz.display_status
        };

        let hiobj = {
            biz: hi.biz,
            icon: hi.display.icon.url,
            background: hi.display.background.url,
            logo: hi.display.logo.url,
            status: hi.display_status
        };

        let gistr = JSON.stringify(giobj);
        let hsrstr = JSON.stringify(hsrobj);
        let zzzstr = JSON.stringify(zzzobj);
        let histr = JSON.stringify(hiobj);

        return JSON.parse(`{"games": [${gistr}, ${hsrstr}, ${zzzstr}, ${histr}]}`);

    } else {
        console.error("Got wrong retcode:" + r.retcode);
    }
}

async function parseGamePackages() {
    let rsp = await fetch(`${gamepackages}`);
    let r = await rsp.json();

    if (r.retcode === 0) {
        let binfo = r.data.game_packages;

        let gi = binfo.find(i => i.game.biz === "hk4e_global");
        let hsr = binfo.find(i => i.game.biz === "hkrpg_global");
        let zzz = binfo.find(i => i.game.biz === "nap_global");
        let hi = binfo.find(i => i.game.biz === "bh3_global");

        let giobj = {
            biz: gi.game.biz,
            game_version: gi.main.major.version,
            full_game: gi.main.major.game_pkgs,
            full_audio: gi.main.major.audio_pkgs,
            scattered_files: gi.main.major.res_list_url,
            diffs: gi.main.patches,
            preload: gi.pre_download
        };

        let hsrobj = {
            biz: hsr.game.biz,
            game_version: hsr.main.major.version,
            full_game: hsr.main.major.game_pkgs,
            full_audio: hsr.main.major.audio_pkgs,
            scattered_files: hsr.main.major.res_list_url,
            diffs: hsr.main.patches,
            preload: hsr.pre_download
        };

        let zzzobj = {
            biz: zzz.game.biz,
            game_version: zzz.main.major.version,
            full_game: zzz.main.major.game_pkgs,
            full_audio: zzz.main.major.audio_pkgs,
            scattered_files: zzz.main.major.res_list_url,
            diffs: zzz.main.patches,
            preload: zzz.pre_download
        };

        let hiobj = {
            biz: hi.game.biz,
            game_version: hi.main.major.version,
            full_game: hi.main.major.game_pkgs,
            full_audio: hi.main.major.audio_pkgs,
            scattered_files: hi.main.major.res_list_url,
            diffs: hi.main.patches,
            preload: hi.pre_download
        };

        let gistr = JSON.stringify(giobj);
        let hsrstr = JSON.stringify(hsrobj);
        let zzzstr = JSON.stringify(zzzobj);
        let histr = JSON.stringify(hiobj);

        return JSON.parse(`{"games": [${gistr}, ${hsrstr}, ${zzzstr}, ${histr}]}`);
    } else {
        console.error("Got wrong retcode:" + r.retcode);
    }
}

async function generateGIManifest() {
    let basicinfo = await parseBasicInfo();
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();
    let gameconfigs = await parseGameConfigs();

    let binfo = basicinfo.games.find(i => i.biz === "hk4e_global");
    let asst = gamesinfo.games.find(i => i.biz === "hk4e_global");
    let pkgs = gamepackages.games.find(i => i.biz === "hk4e_global");
    let gcfg = gameconfigs.games.find(i => i.biz === "hk4e_global");

    var fg = [];
    pkgs.full_game.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5
        });
    });

    var fa = [];
    pkgs.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });

    var dg = [];
    pkgs.diffs.forEach(e => {
        e.game_pkgs.forEach(e2 => {
            return dg.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version
            });
        })
    });

    var da = [];
    pkgs.diffs.forEach(e => {
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


    let gamepkginfo = {
        full: fg,
        diff: dg
    }

    let audiopkginfo = {
        full: fa,
        diff: da
    }

    let metadatainfo = {
        versioned_name: `GenshinImpact ${pkgs.game_version} (Global)`,
        version: pkgs.game_version,
        game_hash: "",
    }

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    }

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    var preloaddata = {};

    // preload handling... ugly hack...
    if (pkgs.preload.major !== null) {
        var pfg = [];
        pkgs.preload.major.game_pkgs.forEach(e => {
            return pfg.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5
            });
        });

        var pfa = [];
        pkgs.preload.major.audio_pkgs.forEach(e => {
            return pfa.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5,
                language: e.language
            });
        });

        var pdg = [];
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

        var pda = [];
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

        let pgsmepkginfo = {
            full: pfg,
            diff: pdg
        }

        let paudiopkginfo = {
            full: pfa,
            diff: pda
        }

        let pmetadatainfo = {
            versioned_name: `GenshinImpact ${pkgs.preload.major.version} Preload (Global)`,
            version: pkgs.preload.major.version,
            game_hash: "",
        }

        preloaddata = {
            metadata: pmetadatainfo,
            game: pgsmepkginfo,
            audio: paudiopkginfo
        }
    }
    // preload handling end

    let gameversions = [];

    // append version
    if (process.argv[2] === "append") {
        if (existsSync(gipath)) {
            let currentf = readFileSync(gipath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== pkgs.game_version) {
                    gameversions.push(v);
                }
            })
        } else {
            gameversions.push(versioninfo);
        }
    } else {
        gameversions.push(versioninfo);
    }

    let final = {
        version: 1,
        display_name: "GenshinImpact (Global)",
        game_versions: gameversions,
        telemetry_hosts: gihosts,
        paths: {
            exe_filename: gcfg.exe_filename,
            installation_dir: gcfg.installation_dir,
            screenshot_dir: gcfg.screenshot_dir,
            screenshot_dir_relative_to: "game_dir"
        },
        assets: {
            game_icon: asst.icon,
            game_logo: "",
            game_background: binfo.background,
        },
        extra: {
            preload: preloaddata
        }
    }

   writeFileSync(gipath, JSON.stringify(final, null, 2));
}

async function generateHSRManifest() {
    let basicinfo = await parseBasicInfo();
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();
    let gameconfigs = await parseGameConfigs();

    let binfo = basicinfo.games.find(i => i.biz === "hkrpg_global");
    let asst = gamesinfo.games.find(i => i.biz === "hkrpg_global");
    let pkgs = gamepackages.games.find(i => i.biz === "hkrpg_global");
    let gcfg = gameconfigs.games.find(i => i.biz === "hkrpg_global");

    var fg = [];
    pkgs.full_game.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5
        });
    });

    var fa = [];
    pkgs.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });

    var dg = [];
    pkgs.diffs.forEach(e => {
        e.game_pkgs.forEach(e2 => {
            return dg.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version
            });
        })
    });

    var da = [];
    pkgs.diffs.forEach(e => {
        e.audio_pkgs.forEach(e2 => {
            return da.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version,
                language: e2.language
            });
        })
    });


    let gamepkginfo = {
        full: fg,
        diff: dg
    }

    let audiopkginfo = {
        full: fa,
        diff: da
    }

    let metadatainfo = {
        versioned_name: `Honkai: StarRail ${pkgs.game_version} (Global)`,
        version: pkgs.game_version,
        game_hash: "",
    }

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    }

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    var preloaddata = {};

    // preload handling... ugly hack...
    if (pkgs.preload.major !== null) {
        var pfg = [];
        pkgs.preload.major.game_pkgs.forEach(e => {
            return pfg.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5
            });
        });

        var pfa = [];
        pkgs.preload.major.audio_pkgs.forEach(e => {
            return pfa.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5,
                language: e.language
            });
        });

        var pdg = [];
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

        var pda = [];
        pkgs.preload.patches.forEach(e => {
            e.audio_pkgs.forEach(e2 => {
                return pda.push({
                    file_url: e2.url,
                    compressed_size: e2.size,
                    decompressed_size: e2.decompressed_size,
                    file_hash: e2.md5,
                    diff_type: "hdiff",
                    original_version: e.version,
                    language: e2.language
                });
            })
        });

        let pgsmepkginfo = {
            full: pfg,
            diff: pdg
        }

        let paudiopkginfo = {
            full: pfa,
            diff: pda
        }

        let pmetadatainfo = {
            versioned_name: `Honkai: StarRail ${pkgs.preload.major.version} Preload (Global)`,
            version: pkgs.preload.major.version,
            game_hash: "",
        }

        preloaddata = {
            metadata: pmetadatainfo,
            game: pgsmepkginfo,
            audio: paudiopkginfo
        }
    }
    // preload handling end

    let gameversions = [];

    // append version
    if (process.argv[2] === "append") {
        if (existsSync(hsrpath)) {
            let currentf = readFileSync(hsrpath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== pkgs.game_version) {
                    gameversions.push(v);
                }
            })
        } else {
            gameversions.push(versioninfo);
        }
    } else {
        gameversions.push(versioninfo);
    }

    let final = {
        version: 1,
        display_name: "Honkai: StarRail (Global)",
        game_versions: gameversions,
        telemetry_hosts: hsrhosts,
        paths: {
            exe_filename: gcfg.exe_filename,
            installation_dir: gcfg.installation_dir,
            screenshot_dir: gcfg.screenshot_dir,
            screenshot_dir_relative_to: "game_dir"
        },
        assets: {
            game_icon: asst.icon,
            game_logo: "",
            game_background: binfo.background,
        },
        extra: {
            preload: preloaddata
        }
    }

    writeFileSync(hsrpath, JSON.stringify(final, null, 2));
}

async function generateZZZManifest() {
    let basicinfo = await parseBasicInfo();
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();
    let gameconfigs = await parseGameConfigs();

    let binfo = basicinfo.games.find(i => i.biz === "nap_global");
    let asst = gamesinfo.games.find(i => i.biz === "nap_global");
    let pkgs = gamepackages.games.find(i => i.biz === "nap_global");
    let gcfg = gameconfigs.games.find(i => i.biz === "nap_global");

    var fg = [];
    pkgs.full_game.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5
        });
    });

    var fa = [];
    pkgs.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });

    var dg = [];
    pkgs.diffs.forEach(e => {
        e.game_pkgs.forEach(e2 => {
            return dg.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version
            });
        })
    });

    var da = [];
    pkgs.diffs.forEach(e => {
        e.audio_pkgs.forEach(e2 => {
            return da.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version,
                language: e2.language
            });
        })
    });


    let gamepkginfo = {
        full: fg,
        diff: dg
    }

    let audiopkginfo = {
        full: fa,
        diff: da
    }

    let metadatainfo = {
        versioned_name: `ZenlessZoneZero ${pkgs.game_version} (Global)`,
        version: pkgs.game_version,
        game_hash: "",
    }

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    }

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    var preloaddata = {};

    // preload handling... ugly hack...
    if (pkgs.preload.major !== null) {
        var pfg = [];
        pkgs.preload.major.game_pkgs.forEach(e => {
            return pfg.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5
            });
        });

        var pfa = [];
        pkgs.preload.major.audio_pkgs.forEach(e => {
            return pfa.push({
                file_url: e.url,
                compressed_size: e.size,
                decompressed_size: e.decompressed_size,
                file_hash: e.md5,
                language: e.language
            });
        });

        var pdg = [];
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

        var pda = [];
        pkgs.preload.patches.forEach(e => {
            e.audio_pkgs.forEach(e2 => {
                return pda.push({
                    file_url: e2.url,
                    compressed_size: e2.size,
                    decompressed_size: e2.decompressed_size,
                    file_hash: e2.md5,
                    diff_type: "hdiff",
                    original_version: e.version,
                    language: e2.language
                });
            })
        });

        let pgsmepkginfo = {
            full: pfg,
            diff: pdg
        }

        let paudiopkginfo = {
            full: pfa,
            diff: pda
        }

        let pmetadatainfo = {
            versioned_name: `ZenlessZoneZero ${pkgs.preload.major.version} Preload (Global)`,
            version: pkgs.preload.major.version,
            game_hash: "",
        }

        preloaddata = {
            metadata: pmetadatainfo,
            game: pgsmepkginfo,
            audio: paudiopkginfo
        }
    }
    // preload handling end

    let gameversions = [];

    // append version
    if (process.argv[2] === "append") {
        if (existsSync(zzzpath)) {
            let currentf = readFileSync(zzzpath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== pkgs.game_version) {
                    gameversions.push(v);
                }
            })
        } else {
            gameversions.push(versioninfo);
        }
    } else {
        gameversions.push(versioninfo);
    }

    let final = {
        version: 1,
        display_name: "ZenlessZoneZero (Global)",
        game_versions: gameversions,
        telemetry_hosts: zzzhosts,
        paths: {
            exe_filename: gcfg.exe_filename,
            installation_dir: gcfg.installation_dir,
            screenshot_dir: gcfg.screenshot_dir,
            screenshot_dir_relative_to: "game_dir"
        },
        assets: {
            game_icon: asst.icon,
            game_logo: "",
            game_background: binfo.background,
        },
        extra: {
            preload: preloaddata
        }
    }

    writeFileSync(zzzpath, JSON.stringify(final, null, 2));
}

async function generateBHManifest() {
    let basicinfo = await parseBasicInfo();
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();
    let gameconfigs = await parseGameConfigs();

    let binfo = basicinfo.games.find(i => i.biz === "bh3_global");
    let asst = gamesinfo.games.find(i => i.biz === "bh3_global");
    let pkgs = gamepackages.games.find(i => i.biz === "bh3_global");
    let gcfg = gameconfigs.games.find(i => i.biz === "bh3_global");

    var fg = [];
    pkgs.full_game.forEach(e => {
        return fg.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5
        });
    });

    var fa = [];
    pkgs.full_audio.forEach(e => {
        return fa.push({
            file_url: e.url,
            compressed_size: e.size,
            decompressed_size: e.decompressed_size,
            file_hash: e.md5,
            language: e.language
        });
    });

    var dg = [];
    pkgs.diffs.forEach(e => {
        e.game_pkgs.forEach(e2 => {
            return dg.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version
            });
        })
    });

    var da = [];
    pkgs.diffs.forEach(e => {
        e.audio_pkgs.forEach(e2 => {
            return da.push({
                file_url: e2.url,
                compressed_size: e2.size,
                decompressed_size: e2.decompressed_size,
                file_hash: e2.md5,
                diff_type: "hdiff",
                original_version: e.version,
                language: e2.language
            });
        })
    });


    let gamepkginfo = {
        full: fg,
        diff: dg
    }

    let audiopkginfo = {
        full: fa,
        diff: da
    }

    let metadatainfo = {
        versioned_name: `HonkaiImpact 3rd ${pkgs.game_version} (Global)`,
        version: pkgs.game_version,
        game_hash: "",
    }

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    }

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    // preload here... TODO: monitor how bh3 does preloads...

    let gameversions = [];

    // append version
    if (process.argv[2] === "append") {
        if (existsSync(bhpath)) {
            let currentf = readFileSync(bhpath);
            let data = JSON.parse(currentf);
            gameversions.push(versioninfo);

            data.game_versions.forEach(v => {
                if (v.metadata.version !== pkgs.game_version) {
                    gameversions.push(v);
                }
            })
        } else {
            gameversions.push(versioninfo);
        }
    } else {
        gameversions.push(versioninfo);
    }

    let final = {
        version: 1,
        display_name: "HonkaiImpact 3rd (Global)",
        game_versions: gameversions,
        telemetry_hosts: bhhosts,
        paths: {
            exe_filename: gcfg.exe_filename,
            installation_dir: gcfg.installation_dir,
            screenshot_dir: gcfg.screenshot_dir,
            screenshot_dir_relative_to: "game_dir"
        },
        assets: {
            game_icon: asst.icon,
            game_logo: "",
            game_background: binfo.background,
        }
    }

    writeFileSync(bhpath, JSON.stringify(final, null, 2));
}

generateGIManifest().then(() => console.log("Generated hk4e_global manifest successfully!"))
generateHSRManifest().then(() => console.log("Generated hkrpg_global manifest successfully!"))
generateZZZManifest().then(() => console.log("Generated nap_global manifest successfully!"))
generateBHManifest().then(() => console.log("Generated bh3_global manifest successfully!"))

