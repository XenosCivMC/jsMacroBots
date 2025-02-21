const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');
const { getDistance, getCenterPosition, directionToString, getPlayerDirection } = require('./lib/vectorUtils.js');
const { selectItem, dropResources, freeInventorySlots } = require('./lib/inventoryUtils.js');

// Chat.log("Hi");
GlobalVars.remove("VeinHelperData");
var data = JSON.parse(GlobalVars.getString("VeinHelperData"));
Chat.log(data);
if (!data)
  data = {};
//
if (!data.blocks)
  data.blocks = [];

var block = Player.rayTraceBlock(100, false);
var blockData = {
  x: block.getX(),
  y: block.getY(),
  z: block.getZ()
}
data.blocks.push(blockData);
GlobalVars.putString("VeinHelperData", JSON.stringify(data));
