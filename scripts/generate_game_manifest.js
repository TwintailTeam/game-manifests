const {writeFileSync} = require('fs');

let basicinfo = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=VYTpXlbWo8&language=en-us&game_id=";
let gamesinfo = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGames?launcher_id=VYTpXlbWo8&language=en-us";
let gamepackages = "https://sg-hyp-api.hoyoverse.com/hyp/hyp-connect/api/getGamePackages?game_ids[]=4ziysqXOQ8&game_ids[]=U5hbdsT9W7&game_ids[]=gopR6Cufr3&game_ids[]=5TIVvvcwtM&launcher_id=VYTpXlbWo8";

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
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();

    let asst = gamesinfo.games.find(i => i.biz === "hk4e_global");
    let pkgs = gamepackages.games.find(i => i.biz === "hk4e_global");

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    };

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
                original_version: e.version,
                is_preload: false
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
                language: e2.language,
                is_preload: false
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

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    let final = {
        version: 1,
        display_name: "GenshinImpact (Global)",
        game_versions: [
            versioninfo
        ],
        telemetry_hosts: gihosts,
        paths: {
            exe_filename: "",
            installation_dir: "",
            screenshot_dir: "",
            screenshot_dir_relative_to: ""
        }
    }

   writeFileSync(gipath, JSON.stringify(final, null, 2));
}

async function generateHSRManifest() {
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();

    let asst = gamesinfo.games.find(i => i.biz === "hkrpg_global");
    let pkgs = gamepackages.games.find(i => i.biz === "hkrpg_global");

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    };

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
                original_version: e.version,
                is_preload: false
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
                language: e2.language,
                is_preload: false
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

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    let final = {
        version: 1,
        display_name: "Honkai: StarRail (Global)",
        game_versions: [
            versioninfo
        ],
        telemetry_hosts: hsrhosts,
        paths: {
            exe_filename: "",
            installation_dir: "",
            screenshot_dir: "",
            screenshot_dir_relative_to: ""
        }
    }

    writeFileSync(hsrpath, JSON.stringify(final, null, 2));
}

async function generateZZZManifest() {
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();

    let asst = gamesinfo.games.find(i => i.biz === "nap_global");
    let pkgs = gamepackages.games.find(i => i.biz === "nap_global");

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    };

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
                original_version: e.version,
                is_preload: false
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
                language: e2.language,
                is_preload: false
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

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    let final = {
        version: 1,
        display_name: "ZenlessZoneZero (Global)",
        game_versions: [
            versioninfo
        ],
        telemetry_hosts: zzzhosts,
        paths: {
            exe_filename: "",
            installation_dir: "",
            screenshot_dir: "",
            screenshot_dir_relative_to: ""
        }
    }

    writeFileSync(zzzpath, JSON.stringify(final, null, 2));
}

async function generateBHManifest() {
    let gamepackages = await parseGamePackages();
    let gamesinfo = await parseGamesInfo();

    let asst = gamesinfo.games.find(i => i.biz === "bh3_global");
    let pkgs = gamepackages.games.find(i => i.biz === "bh3_global");

    let assetcfg = {
        game_icon: asst.icon,
        game_logo: asst.logo,
        game_background: asst.background
    };

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
                original_version: e.version,
                is_preload: false
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
                language: e2.language,
                is_preload: false
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

    let versioninfo = {
        metadata: metadatainfo,
        assets: assetcfg,
        game: gamepkginfo,
        audio: audiopkginfo
    }

    let final = {
        version: 1,
        display_name: "HonkaiImpact 3rd (Global)",
        game_versions: [
            versioninfo
        ],
        telemetry_hosts: bhhosts,
        paths: {
            exe_filename: "",
            installation_dir: "",
            screenshot_dir: "",
            screenshot_dir_relative_to: ""
        }
    }

    writeFileSync(bhpath, JSON.stringify(final, null, 2));
}

generateGIManifest().then(() => console.log("Generated hk4e_global manifest successfully!"))
generateHSRManifest().then(() => console.log("Generated hkrpg_global manifest successfully!"))
generateZZZManifest().then(() => console.log("Generated nap_global manifest successfully!"))
generateBHManifest().then(() => console.log("Generated bh3_global manifest successfully!"))

