module.exports = function DGTeleport(mod) {
    const cmd = mod.command || mod.require.command;
    const path = require('path');
    const COLORS = ["#00b159","#00aedb","#ffc425","#f37735","#d11141"]                   

    mod.dispatch.addDefinition('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, path.join(__dirname, 'C_REQUEST_EVENT_MATCHING_TELEPORT.0.def'));
    mod.dispatch.addDefinition('S_AVAILABLE_EVENT_MATCHING_LIST', 0, path.join(__dirname, 'S_AVAILABLE_EVENT_MATCHING_LIST.0.def'));

    let teleportList = []
    mod.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 0, (e) => {
        if(teleportList.length > 0) return;

        // Get available Dungeon events id -- type 0
        const available = e.quests.filter(x => x.type == 0).map(x => x.id)

        mod.queryData('/EventMatching/EventGroup/Event@type=?', ['Dungeon'], true).then((events) => {    
            // Filter only available and sort by ilvl 
            events = events
                .filter((x) => available.includes(x.attributes.id))
                .sort((b, a) => a.attributes.requiredItemLevel - b.attributes.requiredItemLevel || a.attributes.id - b.attributes.id)

            // Get min/max ilvl for coloring
            const minIlvl = Math.min(...events.map(e => e.attributes.requiredItemLevel))
            const maxIlvl = Math.max(...events.map(e => e.attributes.requiredItemLevel))

            events.forEach((event) => {    
                const zoneId = event.children.find(x => x.name == "TargetList").children.find(x => x.name == "Target").attributes.id
    
                mod.queryData('/StrSheet_Dungeon/String@id=?', [zoneId]).then((dungeon) => {   
                    // Calc acronyms and iLvl color 
                    const regex = / |of|\(.*\)/i
                    const acronym = dungeon.attributes.string.split(regex).map(x => x.charAt(0).toLowerCase()).join('')
                    const color = Math.ceil((COLORS.length-1) * (event.attributes.requiredItemLevel - minIlvl) / (maxIlvl - minIlvl))

                    teleportList.push({
                        eventId: event.attributes.id,
                        dungeonName: dungeon.attributes.string,
                        acronyms: [ acronym, acronym+'n', acronym+'h' ],
                        requiredItemLevel: event.attributes.requiredItemLevel,
                        zoneId: zoneId,
                        color: COLORS[color]
                    })
                });
            })
        });
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

    function search(value) {
        return teleportList.find((e) => e.acronyms.includes(value) || (value.length > 3 && e.dungeonName.toLowerCase().includes(value)));
    }

    function tpList() {
        if (Object.keys(teleportList).length > 0) {
            let list = [];
            teleportList.forEach((x) => {
                list.push({
                    text: `<font color="${x.color}" size="+24">* ${x.dungeonName} <font size="+14">(${x.requiredItemLevel})</font></font><br>`,
                    command: `dg ${x.acronyms[0]}`,
                });
            });
            gui.parse(list, `<font color="#E0B0FF">Dungeon Teleport List</font>`);
            list = [];
        }
    }

    function teleport(dungeon) {
        let success = false;

        mod.send('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, {
            eventId: dungeon.eventId,
            zoneId: dungeon.zoneId,
        });

        const zoneLoaded = mod.hook('S_LOAD_TOPO', 'raw', (e) => {
            success = true;
            mod.unhook(zoneLoaded);
            cmd.message(`Successfully teleported to ${dungeon.dungeonName}.`);
        })

        mod.setTimeout(() => {
            if (!success) {
                mod.unhook(zoneLoaded);
                cmd.message(`You cannot teleport to ${dungeon.dungeonName}. Check your iLvl.`);
            }
                
        }, 1500);
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
};
