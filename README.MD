# dg-teleport
Fast teleport to every important dungeon with GUI or not. Patch 95.4 safe.
Will work on any patch, region, language and dungeons added later, as it uses the database from the game.

## Usage
### `dg`
- Bring the GUI with dungeon list
### `dg "name"`
### `dg "abbreviation"`
### `dg "part of name (3+ letters)"`
- Instant teleport to dungeon entrance
Ex. **dg forbidden arena** = **dg fa** = **dg forb**

## Instalation
- Copy the mod to TeraToolbox/mods folder
- Add the following opcodes to TeraToolbox/data/opcodes/protocol.xxxxxxx.map file:

### NA 95.4 (24/06)
C_REQUEST_EVENT_MATCHING_TELEPORT 36052

### EU 95.4 (30/06)
C_REQUEST_EVENT_MATCHING_TELEPORT 38766

## Info
You can use part of dungeon name or its known abbreviations. eg.: gls, aahm, aq...

You need to have proper ilvl to teleport to each dungeon.

Mod uses the original 'Go to Dungeon Entrance' button to teleport you, so don't be afraid.

Mod is Patch 93+ safe as it does not use any protocol with integrity hash.

## Known issues
There is a known Vanguard List bug introduced on TERA patch 95, that make the game doesn't load vanguard missions.
Check your Vanguards window (H), if there are no dungeons in the list, you'll have to teleport to ghillie and reopen the Vanguards window to reload the dungeon list.
Now the dungeons should be in the list and you can use the mod as normal.

---
