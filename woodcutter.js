var botname = "XenosWoodCutterBot";

var blocksBetweenTrees = 5;

var farmLength = 16;
var farmWidth = 14;

var treeType = "birch";

// time to break a log in ticks
// stone axe is roughly 21
var chopTime = 21;
//
// if this is set to true the player will drop the resources into a water chute.
var doDropResources = true;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');
const { getDistance, getCenterPosition, directionToString, getPlayerDirection } = require('./lib/vectorUtils.js');
const { selectItem, dropResources, freeInventorySlots } = require('./lib/inventoryUtils.js');

function cutTree(goalPosition) {
  var toolTime = chopTime;
  var doJump = true;
  if (treeType == "birch")
    doJump = false;
  selectItem("_axe");
  // walk to the tree while swinging
  while ((getDistance(currentPos, goalPosition) > 0.3) && isRunning(botname)) {
    KeyBind.key("key.mouse.left", true);
    KeyBind.keyBind('key.forward', true);
    player.lookAt(goalPosition.x, goalPosition.y, goalPosition.z);

    Client.waitTick(1);
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.forward', false);
  // To be at that specific position the player must already have broken the 2 lower blocks.
  // Look up and break as much blocks as possible
  player.lookAt(0, -90);
  Client.waitTick(toolTime * 6);
  if (doJump) {
    // look down, place a block
    selectItem("log");
    KeyBind.key("key.mouse.left", false);
    Client.waitTick(5);
    player.lookAt(0, 90);
    KeyBind.keyBind('key.jump', true);
    KeyBind.key("key.mouse.right", true);
    Client.waitTick(5);
    KeyBind.key("key.mouse.right", false);
    KeyBind.keyBind('key.jump', false);
    // look back up and break last log
    selectItem("_axe");
    KeyBind.key("key.mouse.left", true);
    player.lookAt(0, -90);
    Client.waitTick(toolTime);
    // look down and break placed block
    player.lookAt(0, 90);
    Client.waitTick(toolTime);
  }
  // look down and place sapling
  Client.waitTick(1);
  player.lookAt(0, 90);
  Client.waitTick(1);
  selectItem("sapling");
  KeyBind.key("key.mouse.right", true);
  KeyBind.key("key.mouse.right", false);
  Client.waitTick(1);

}

function dropWoodStuff() {
  const droppedResources = [
    "Spruce Log", "Spruce Sapling",
    "Oak Log", "Oak Sapling",
    "Jungle Log", "Jungle Sapling",
    "Birch Log", "Birch Sapling",
    "Acacia Log", "Acacia Sapling",
    "Dark Oak Log", "Dark Oak Sapling",
    "Stick"
  ];
  player.lookAt(45, 45);
  Client.waitTick(5);
  dropResources(droppedResources, true);
  Client.waitTick(5);
}

function lumberjackLoop() {
  // copy startingPos and determine goal from it
  var goalPosition = { ...startingPos };

  // TODO: this if statement ... needs work.
  // when the player gets to the end of the line turn and go back
  if (
    ((primaryDir.x != 0) && (currentPrimaryDir.x == primaryDir.x) && (startingPos.x == trueStartingPos.x + (blocksBetweenTrees * currentPrimaryDir.x * (farmLength - 1))))
    || ((primaryDir.x != 0) && (currentPrimaryDir.x != primaryDir.x) && (startingPos.x == trueStartingPos.x))
    || ((primaryDir.z != 0) && (currentPrimaryDir.z == primaryDir.z) && (startingPos.z == trueStartingPos.z + (blocksBetweenTrees * currentPrimaryDir.z * (farmLength - 1))))
    || ((primaryDir.z != 0) && (currentPrimaryDir.z != primaryDir.z) && (startingPos.z == trueStartingPos.z))
  ) {
    // take a "step" to the secondary Direction
    goalPosition.x += (blocksBetweenTrees * secondaryDir.x);
    goalPosition.z += (blocksBetweenTrees * secondaryDir.z);
    // negate direction
    currentPrimaryDir.x *= -1;
    currentPrimaryDir.z *= -1;
  } else {
    goalPosition.x += (blocksBetweenTrees * currentPrimaryDir.x);
    goalPosition.z += (blocksBetweenTrees * currentPrimaryDir.z);
  }

  cutTree(goalPosition);

  startingPos = getCenterPosition(player.getPos());

  if (doDropResources && freeInventorySlots() == 0) {
    dropWoodStuff();

  } // if the player is here the script should finish
  var ultimateGoalPosition = { ...trueStartingPos };
  ultimateGoalPosition.x += ((farmWidth - 1) * blocksBetweenTrees) * secondaryDir.x;
  ultimateGoalPosition.z += ((farmWidth - 1) * blocksBetweenTrees) * secondaryDir.z;

  // if farmLength is uneven ultimateGoal must be at the end of the line
  // because of alternating paths
  if (farmWidth % 2 == 1) {
    ultimateGoalPosition.x += ((farmLength - 1) * blocksBetweenTrees) * primaryDir.x;
    ultimateGoalPosition.z += ((farmLength - 1) * blocksBetweenTrees) * primaryDir.z;
  }

  if (getDistance(currentPos, ultimateGoalPosition) < 0.3) {
    if (doDropResources)
      dropWoodStuff();
    GlobalVars.putBoolean(botname, false);
    return;
  }
}

const inv = Player.openInventory();
const player = Player.getPlayer();
const trueStartingPos = getCenterPosition(player.getPos());
var startingPos = getCenterPosition(player.getPos());
var currentPos = player.getPos();

var dir = getPlayerDirection();
var secondaryDir = dir.secondaryDir;
var primaryDir = dir.primaryDir;

currentPrimaryDir = { ...primaryDir };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

toggleGlobalVar(botname);

while (isRunning(botname)) {
  lumberjackLoop();
  Client.waitTick(1);
  if (!isRunning(botname)) {
    cleanup();
  }
}
