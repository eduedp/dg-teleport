# dg-teleport 
Fast teleport to every important dungeon with GUI or not. Patch 95 safe.

## Usage
### `dg`
- Bring the GUI with dungeon list
### `dg "name"`
- Instant teleport to dungeon entrance

## Instalation
- Copy the mod to TeraToolbox/mods folder
- Add the following opcodes to TeraToolbox/data/opcodes/protocol.xxxxxxx.map file:

### NA 95.3
C_REQUEST_EVENT_MATCHING_TELEPORT 44548

### EU 95.3
C_REQUEST_EVENT_MATCHING_TELEPORT 41517

## Info
You can use part of dungeon name or its known abbreviations. eg.: gls, aahm, aq...

You need to have proper ilvl to teleport to each dungeon.

Mod uses the original 'Go to Dungeon Entrance' button to teleport you, so don't be afraid.

Mod is Patch 93+ safe as it does not use any protocol with integrity hash.

---
