module.exports = function DGTeleport(mod) {
    const cmd = mod.command || mod.require.command;
    const path = require('path');

    const QUEST_ID_MODIFIER = 90000;
    const dungeons = jsonRequire('./dungeon-list.json').filter((x) => x.active);
    let quests;

    mod.dispatch.addDefinition('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, path.join(__dirname, 'C_REQUEST_EVENT_MATCHING_TELEPORT.0.def'));

    mod.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, (e) => {
        quests = [];
        quests = e.quests.map((x) => x.id);
    });

    cmd.add('dg', (value) => {
        if (value && value.length > 0) value = value.toLowerCase();
        if (value) {
            const dungeon = search(value);
            if (!dungeon) {
                cmd.message(`Cannot find dungeon [${value}]`);
                return;
            }

            teleport(dungeon);
        } else {
            tpList();
        }
    });

    function jsonRequire(data) {
        delete require.cache[require.resolve(data)];
        return require(data);
    }

    const gui = {
        parse(array, title, d = '') {
            for (let i = 0; i < array.length; i++) {
                if (d.length >= 16000) {
                    d += `Gui data limit exceeded, some values may be missing.`;
                    break;
                }
                if (array[i].command) d += `<a href="admincommand:/@${array[i].command}">${array[i].text}</a>`;
                else if (!array[i].command) d += `${array[i].text}`;
                else continue;
            }
            mod.toClient('S_ANNOUNCE_UPDATE_NOTIFICATION', 1, {
                id: 0,
                title: title,
                body: d,
            });
        },
    };

    function tpList() {
        if (Object.keys(dungeons).length > 0) {
            let list = [];
            dungeons.forEach((x) => {
                list.push({
                    text: `<font color="${x.color}" size="+24">* ${x.name}</font><br>`,
                    command: `dg ${x.dg[0]}`,
                });
            });
            gui.parse(list, `<font color="#E0B0FF">Dungeon Teleport List</font>`);
            list = [];
        }
    }

    function search(value) {
        return dungeons.find((e) => e.active && e.dg.map((x) => x.toLowerCase()).includes(value) || (value.length > 3 && e.name.toLowerCase().includes(value)));
    }

    function teleport(dungeon) {
        let success = false;
        let idModifier = 0;

        if(quests && !quests.includes(dungeon.quest)) idModifier = QUEST_ID_MODIFIER;

        mod.send('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, {
            quest: dungeon.quest + idModifier,
            instance: dungeon.instance,
        });

        const zoneLoaded = mod.hook('S_LOAD_TOPO', 'raw', (e) => {
            success = true;
            mod.unhook(zoneLoaded);
            cmd.message(`Successfully teleported to ${dungeon.name}.`);
        })

        mod.setTimeout(() => {
            if (!success) {
                mod.unhook(zoneLoaded);
                cmd.message(`You cannot teleport to ${dungeon.name}. Check your iLvl.`);
            }
                
        }, 1000);
    }
};
