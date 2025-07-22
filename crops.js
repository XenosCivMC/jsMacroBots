var botname = "XenosWheatBot";

// Start in the southwest corner, facing north
var farmLength = 16; //90
var farmWidth = 18; //98 + 27 = 125

// if this is set to true the player will drop the resources at the end of the line into a water chute.
// it is set to do this every other line.
var doDropResources = true;
var droppedResources = ["Wheat", "Wheat Seeds", "Carrot"];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * Toggles a JSMacro GlobalVar.
  * Is used for determining if a specific bot is running.
  * With this the script can even be run as a hotkey, cause it will be ended properly!
  * Also note that the "Bot finished" message is done in cleanup, because of timings.
  */
function toggleGlobalVar(botname) {
  const reverse = !GlobalVars.getBoolean(botname);
  GlobalVars.putBoolean(botname, reverse);
  if (reverse) {
    Chat.log(Chat.createTextBuilder().append("[").withColor(0x7)
      .append(botname).withColor(0x5)
      .append("]").withColor(0x7).append(" enabled").withColor(0xa)
      .build());
  }
}

/**
  * Centers the given position to the middle of the block.
  * Only works in xz direction!
  */
function getCenterPosition(position) {
  var newPos = {
    x: Math.floor(position.x) + 0.5,
    y: position.y,
    z: Math.floor(position.z) + 0.5
  };

  return newPos;
}

/**
  * Calculates the distance between 2 positions.
  * Only works in xz direction!
  */
function getDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.z - pos1.z) ** 2);
}

/**
  * Syntactic sugar for checking a GlobalVar Boolean.
  * See toggleGlobalVar(botname)
  */
function isRunning(botname) {
  return GlobalVars.getBoolean(botname);
}

/**
  * Runs after the script is finished or toggled (via hotkey)
  */
function cleanup() {
  KeyBind.keyBind('key.sneak', false);
  KeyBind.key("key.mouse.right", false);
  KeyBind.keyBind('key.forward', false);

  // Because of timings the chat message is done here and not in toggleGlobalVar()
  Chat.log(Chat.createTextBuilder().append("[").withColor(0x7)
    .append(botname).withColor(0x5)
    .append("]").withColor(0x7).append(" disabled").withColor(0xc)
    .build());
}

/**
  * Drops specific resources on the ground (or in a water drop chute)
  */
function dropResources() {
  // skip if bot is already aborted
  if (!isRunning(botname))
    return;
  // look north. TODO
  player.lookAt(180, 45);
  Client.waitTick(5);
  // iterate every inventory slot
  for (var i = 0; i <= 44; i++) {
    // if wheat or seed...
    // if (inv.getSlot(i).getName().getString() == crop || inv.getSlot(i).getName().getString() == cropSeeds) {
    if (droppedResources.includes(inv.getSlot(i).getName().getString())) {
      // ... click it ...
      inv.click(i);
      Client.waitTick(1);
      // ... and then click on the ground.
      inv.click(-999);
    }
  }
  Client.waitTick(1);
}

/** 
  * actual farming loop
  */
function farm() {
  KeyBind.keyBind('key.sneak', false);
  KeyBind.key("key.mouse.right", true);
  // copy startingPos and determine goal from it
  var goalPosition = { ...startingPos };
  goalPosition.z += (farmLength - 1.0) * dir;
  // also look into the ground. When I am thinking about it... probably not necessary
  goalPosition.y -= 2;
  // When starting a line start looking at the ground, and then "slowly" up
  player.lookAt(90 - 90 * dir, 90);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 80);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 70);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 60);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 50);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 40);
  Client.waitTick(3);
  player.lookAt(90 - 90 * dir, 30);
  Client.waitTick(5);
  // walk to the end of the line
  while ((getDistance(currentPos, goalPosition) > 0.5) && isRunning(botname)) {
    KeyBind.key("key.mouse.right", true);
    // look forward, slightly down
    player.lookAt(90 - 90 * dir, 15);
    KeyBind.keyBind('key.forward', true);
    KeyBind.keyBind('key.sprint', true);
    Client.waitTick(1);
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.forward', false);
  Client.waitTick(5);
  // only drops resources every other line
  // and if its enabled
  if (dir == -1 && doDropResources) {
    dropResources();
  }
  KeyBind.key("key.mouse.right", true);

  // Adjusting one block to the side
  goalPosition.x += 1;
  while ((getDistance(currentPos, goalPosition) > 0.5) && isRunning(botname)) {
    KeyBind.key("key.mouse.right", true);
    KeyBind.keyBind('key.sneak', true);
    // Look at the block to the right
    player.lookAt(goalPosition.x, goalPosition.y, goalPosition.z);
    KeyBind.keyBind('key.forward', true);
    KeyBind.keyBind('key.sprint', true);

    Client.waitTick(1);
    currentPos = player.getPos();
    // stop if all lines are farmed
    if (currentPos.x >= trueStartingPos.x + (farmWidth - 1)) {
      GlobalVars.putBoolean(botname, false);
      return;
    }
  }
  Client.waitTick(5);
  KeyBind.keyBind('key.forward', false);
  currentPos = player.getPos();
  // calculates the new startingPos
  startingPos.x += 1;
  startingPos.z += (farmLength - 1.0) * dir;
  dir *= -1;
}


const inv = Player.openInventory();
const player = Player.getPlayer();
const trueStartingPos = getCenterPosition(player.getPos());
var startingPos = getCenterPosition(player.getPos());
var currentPos = player.getPos();
var dir = -1;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

toggleGlobalVar(botname);

var farming = true;
while (farming && isRunning(botname)) {
  farm();
  Client.waitTick(1);
  if (!isRunning(botname)) {
    cleanup();
  }
}
