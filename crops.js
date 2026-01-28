var botname = "XenosWheatBot";

// Start in the southwest corner, facing north
// var farmLength = 16; //90
// var farmWidth = 16; //98 + 27 = 125
var farmLength = 54; //90
var farmWidth = 279; //98 + 27 = 125

// if this is set to true the player will drop the resources at the end of the line into a water chute.
// it is set to do this every other line.
var doDropResources = true;
var droppedResources = ["Wheat", "Wheat Seeds", "Carrot", "Potato"];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');
const { getDistance, getCenterPosition, getPlayerDirection } = require('./lib/vectorUtils.js');
const { dropResources } = require('./lib/inventoryUtils.js');

const globalTickWait = 5;

function calculateYaw(currentPos, goalPos) {
  const dx = goalPos.x - currentPos.x;
  const dz = goalPos.z - currentPos.z;

  const yawRadians = Math.atan2(dz, dx);

  let yawDegrees = yawRadians * (180 / Math.PI) - 90;

  if (yawDegrees > 180) {
    yawDegrees -= 360;
  } else if (yawDegrees < -180) {
    yawDegrees += 360;
  }

  return yawDegrees;
}

function lookupSteps(yaw, from, to, steps, ticksBetweenSteps) {
  const step = (to - from) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    player.lookAt(yaw, from + (step * i));
    Client.waitTick(ticksBetweenSteps);
  }
}

/** 
  * actual farming loop
  */
function farm() {
  KeyBind.keyBind('key.sneak', false);
  KeyBind.key("key.mouse.right", true);
  // copy startingPos and determine goal from it
  var goalPosition = { ...startingPos };
  goalPosition.x += (farmLength - 1.0) * currentPrimaryDir.x;
  goalPosition.z += (farmLength - 1.0) * currentPrimaryDir.z;

  const yaw = calculateYaw(player.getPos(), goalPosition);
  // When starting a line start looking at the ground, and then "slowly" up
  lookupSteps(yaw, 90, 20, 8, 3);
  // walk to the end of the line
  while ((getDistance(currentPos, goalPosition) > 0.5) && isRunning(botname)) {
    KeyBind.key("key.mouse.right", true);
    // look forward, slightly down
    player.lookAt(yaw, 20);
    KeyBind.keyBind('key.forward', true);
    // KeyBind.keyBind('key.sprint', true);
    Client.waitTick(1);
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.forward', false);
  Client.waitTick(5);
  // only drops resources every other line
  // and if its enabled
  if (currentPrimaryDir.x == 1 && doDropResources) {
    dropResources(droppedResources, false);
  }
  KeyBind.key("key.mouse.right", true);

  // Adjusting one block to the side
  goalPosition.x += secondaryDir.x;
  goalPosition.z += secondaryDir.z;
  while ((getDistance(currentPos, goalPosition) > 0.5) && isRunning(botname)) {
    KeyBind.key("key.mouse.right", true);
    KeyBind.keyBind('key.sneak', true);
    // Look at the block to the right
    player.lookAt(goalPosition.x, goalPosition.y, goalPosition.z);
    KeyBind.keyBind('key.forward', true);
    // KeyBind.keyBind('key.sprint', true);

    Client.waitTick(1);
    currentPos = player.getPos();
    // stop if all lines are farmed
    //
    var ultimateGoalPosition = { ...trueStartingPos };
    ultimateGoalPosition.x += (farmWidth - 1) * secondaryDir.x;
    ultimateGoalPosition.z += (farmWidth - 1) * secondaryDir.z;

    // if farmLength is uneven ultimateGoal must be at the end of the line
    // because of alternating paths
    if (farmWidth % 2 == 1) {
      ultimateGoalPosition.x += (farmLength - 1) * primaryDir.x;
      ultimateGoalPosition.z += (farmLength - 1) * primaryDir.z;
    }

    if (getDistance(currentPos, ultimateGoalPosition) < 0.3) {
      GlobalVars.putBoolean(botname, false);
      return;
    }
  }
  Client.waitTick(5);
  KeyBind.keyBind('key.forward', false);
  currentPos = player.getPos();
  // calculates the new startingPos
  startingPos.x += (farmLength - 1.0) * currentPrimaryDir.x;
  startingPos.z += (farmLength - 1.0) * currentPrimaryDir.z;

  startingPos.x += secondaryDir.x;
  startingPos.z += secondaryDir.z;
  // negate direction
  currentPrimaryDir.x *= -1;
  currentPrimaryDir.z *= -1;
}


const player = Player.getPlayer();
const trueStartingPos = getCenterPosition(player.getPos());
var startingPos = getCenterPosition(player.getPos());
var currentPos = player.getPos();

var dir = getPlayerDirection();
var secondaryDir = dir.secondaryDir;
var primaryDir = dir.primaryDir;

var currentPrimaryDir = { ...primaryDir };

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

toggleGlobalVar(botname);

while (isRunning(botname)) {
  farm();
  Client.waitTick(globalTickWait);
  if (!isRunning(botname)) {
    cleanup(botname);
  }
}
