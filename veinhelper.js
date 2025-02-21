var botname = "XenosVeinHelper";

const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');
const { getDistance, getCenterPosition, directionToString, getPlayerDirection } = require('./lib/vectorUtils.js');
const { selectItem, dropResources, freeInventorySlots } = require('./lib/inventoryUtils.js');

toggleGlobalVar(botname);

let found = Hud.createDraw3D();
Hud.registerDraw3D(found);

// var block  = Player.rayTraceBlock(100, false);
var data = JSON.parse(GlobalVars.getString("VeinHelperData"));
// var positions = [
//   // { x: -2039, y: -13, z: 9409 },
//   { x: block.getX(), y: block.getY(), z: block.getZ() },
// ];
var positions = data.blocks;

var size = 11;

positions.forEach((position) => {
var box = found.addBox(position.x - Math.floor(size / 2), position.y - Math.floor(size / 2), position.z - Math.floor(size / 2),
  position.x + Math.ceil(size / 2), position.y + Math.ceil(size / 2), position.z + Math.ceil(size / 2),
  0xFFFFFF, 0xFF, 0xFFFFFF, 0x32, true);
});

while (isRunning(botname)) {
  Client.waitTick(1);
  if (!isRunning(botname)) {
    cleanup();
  }
}
Hud.unregisterDraw3D(found)
