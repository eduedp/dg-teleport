# dg-teleport
Fast teleport to every important dungeon with GUI or not. Patch 98 safe.
Will work on any patch, region, language and dungeons added later, as it uses the database from the game.

![](https://github.com/eduedp/dg-teleport/raw/master/screenshot.png)

## Usage
### `dg` | `go` | `dungeon`
- Bring the GUI with dungeon list
### `dg "name"`
### `dg "abbreviation"`
### `dg "part of name"`
- Instant teleport to dungeon entrance
- Ex. **`dg forbidden arena`** or **`dg fa`** or even **`dg forb`** will teleport you to FA entrance.

## Instalation
- Add the opcode `C_REQUEST_EVENT_MATCHING_TELEPORT` for your region to `TeraToolbox\data\opcodes\protocol.xxxxxxx.map`
- You can find opcodes at this link https://github.com/tera-proxy/tera-proxy/tree/master/node_modules/tera-data/map

## Info
You can use part of dungeon name or its known abbreviations. eg.: gls, aahm, aq...
You need to have proper ilvl to teleport to each dungeon.
Mod uses the original 'Go to Dungeon Entrance' button to teleport you, so it's safe.

## Known issues
There is a known Vanguard List bug introduced on TERA patch 95, that make the game doesn't load vanguard missions.
Check your Vanguards window (H), if there are no dungeons in the list, you'll have to teleport to ghillie and reopen the Vanguards window to reload the dungeon list.
Now the dungeons should be in the list and you can use the mod as normal.

---
