module.exports = function DGTeleport(mod) {
    const cmd = mod.command || mod.require.command;
    const path = require('path');

    const dungeons = jsonRequire('./dungeon-list.json');
    mod.dispatch.addDefinition('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, path.join(__dirname, 'C_REQUEST_EVENT_MATCHING_TELEPORT.0.def'));

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
        return dungeons.find((e) => e.dg.map((x) => x.toLowerCase()).includes(value) || (value.length > 3 && e.name.toLowerCase().includes(value)));
    }

    function teleport(dungeon) {
        let success = false;
        mod.send('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, {
            quest: dungeon.quest,
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
