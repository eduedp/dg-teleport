exports.ClientMod = function(mod) {
    this.allDungeons
    const dungeons = new Map()

    mod.clientInterface.once('ready', async () => {

        mod.queryData('/EventMatching/EventGroup/Event@type=?', ['Dungeon'], true, true, ['id', 'requiredItemLevel']).then((result) => {

            this.allDungeons = result.map(e => {
                const zoneId = e.children.find(x => x.name == 'TargetList').children.find(x => x.name == 'Target').attributes.id
                let dungeon = dungeons.get(zoneId)
                if (!dungeon) {
                    dungeon = { 
                        zoneId: zoneId, 
                        name: '', 
                        acronyms: [], 
                    }
                    dungeons.set(zoneId, dungeon)
                }

                return {
                    eventId: e.attributes.id, 
                    requiredItemLevel: e.attributes.requiredItemLevel,
                    dungeon: dungeon,
                }
            })

            mod.queryData('/StrSheet_Dungeon/String@id=?', [[... dungeons.keys()]], true).then((result) => {
                const acronymRegex = / |of|\(.*/i
                result.forEach(d => {
                    const dungeon = dungeons.get(d.attributes.id)
                    const acronym = d.attributes.string.split(acronymRegex).map(x => x?.charAt(0).toLowerCase()).join('')
                    dungeon['name'] = d.attributes.string
                    dungeon['acronyms'] = [acronym, acronym+'n', acronym+'h']
                })
            })
        })
    })
}

exports.NetworkMod = function(mod) {
    const cmd = mod.command || mod.require.command
    const path = require('path')

    const ALL_COLORS = ['#d11141', '#f37735', '#ffc425', '#00b159', '#00aedb', '#7fd6ed', '#ffffff']
    let availableEvents = []
    let teleportList = []
    let colors = new Map()

    mod.dispatch.addDefinition('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, path.join(__dirname, 'C_REQUEST_EVENT_MATCHING_TELEPORT.0.def'))

    mod.setTimeout(() => {
        const valid = mod.dispatch.protocolMap.name.get('C_REQUEST_EVENT_MATCHING_TELEPORT')
        if (valid === undefined || valid == null) {
            mod.error(`Could not load DG-Teleport. Missing C_REQUEST_EVENT_MATCHING_TELEPORT in the protocol map.`)
        }
    }, 1000)

    mod.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, (e) => {
        // Get available Dungeon events id -- type 0 (unk2)
        const newAvailableEvents = e.quests.filter(x => x.unk2 == 0).map(x => x.id)
        if (newAvailableEvents.join('') == availableEvents.join('')) return
        
        availableEvents = newAvailableEvents
        teleportList = []

        // Filter only available and sort by ilvl 
        teleportList = mod.clientMod.allDungeons
            .filter((x) => availableEvents.includes(x.eventId))
            .sort((b, a) => a.requiredItemLevel - b.requiredItemLevel || a.eventId - b.eventId)

        // Calc ilvl colors
        const ilvl = [... new Set(teleportList.map(x => x.requiredItemLevel))]
        ilvl.forEach((ilvl, x) => colors.set(ilvl, ALL_COLORS[x]))
    })

    cmd.add('dg', (value) => {
        if (value && value.length > 0) value = value.toLowerCase()
        if (value) {
            const dungeon = search(value)
            if (!dungeon) {
                cmd.message(`Cannot find dungeon [${value}]`)
                return
            }

            teleport(dungeon)
        } else {
            tpList()
        }
    })

    function search(value) {
        return teleportList.find((x) => x.dungeon.acronyms.includes(value) || (value.length > 3 && x.dungeon.name.toLowerCase().includes(value)))
    }

    function tpList() {
        if (Object.keys(teleportList).length > 0) {
            let list = []
            teleportList.forEach((x) => {
                list.push({
                    text: `<font color="${colors.get(x.requiredItemLevel)}" size="+24">* ${x.dungeon.name} <font size="+14">(${x.requiredItemLevel})</font></font><br>`,
                    command: `dg ${x.dungeon.acronyms[0]}`,
                })
            })
            gui.parse(list, `<font color="#E0B0FF">Dungeon Teleport List</font>`)
            list = []
        } else {
            cmd.message(`Teleport list empty. Check your current iLvl or Vanguard Requests (H)`)
        }
    }

    function teleport(x) {
        let success = false

        mod.send('C_REQUEST_EVENT_MATCHING_TELEPORT', 0, {
            eventId: x.eventId,
            zoneId: x.dungeon.zoneId,
        })

        const zoneLoaded = mod.hook('S_LOAD_TOPO', 'raw', (e) => {
            success = true
            mod.unhook(zoneLoaded)
            cmd.message(`Successfully teleported to ${x.dungeon.name}.`)
        })

        mod.setTimeout(() => {
            if (!success) {
                mod.unhook(zoneLoaded)
                cmd.message(`You cannot teleport to ${x.dungeon.name}. Check your current iLvl or Vanguard Requests (H)`)
            }
        }, 2000)
    }

    const gui = {
        parse(array, title, d = '') {
            for (let i = 0; i < array.length; i++) {
                if (d.length >= 16000) {
                    d += `Gui data limit exceeded, some values may be missing.`
                    break
                }
                if (array[i].command) d += `<a href="admincommand:/@${array[i].command}">${array[i].text}</a>`
                else if (!array[i].command) d += `${array[i].text}`
                else continue
            }
            mod.toClient('S_ANNOUNCE_UPDATE_NOTIFICATION', 1, {
                id: 0,
                title: title,
                body: d,
            })
        },
    }
}
