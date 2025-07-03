let botname = "XenosCocoaBot";
let farmLength = 29;
let farmRows = 38;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
function cleanup(botname) {
  if (!botname) botname = "";

  KeyBind.keyBind('key.sneak', false);
  KeyBind.key("key.mouse.right", false);
  KeyBind.key("key.mouse.left", false);
  KeyBind.keyBind('key.forward', false);
  KeyBind.keyBind('key.jump', false);
  KeyBind.keyBind('key.right', false);
  KeyBind.keyBind('key.left', false);

  // Because of timings the chat message is done here and not in toggleGlobalVar()
  Chat.log(Chat.createTextBuilder().append("[").withColor(0x7)
    .append(botname).withColor(0x5)
    .append("]").withColor(0x7).append(" disabled").withColor(0xc)
    .build());
}

function isRunning(botname) {
  return GlobalVars.getBoolean(botname);
}
function getCenterPosition(position) {
  var newPos = {
    x: Math.floor(position.x) + 0.5,
    y: Math.floor(position.y) + 0.5,
    z: Math.floor(position.z) + 0.5
  };

  return newPos;
}
function getPlayerDirection() {
  const player = Player.getPlayer();
  const yaw = player.getYaw();

  if (yaw >= -180 && yaw < -135)
    return { primaryDir: { x: 0, z: -1 }, secondaryDir: { x: 1, z: 0 } };
  if (yaw >= -135 && yaw < -90)
    return { primaryDir: { x: 1, z: 0 }, secondaryDir: { x: 0, z: -1 } };
  if (yaw >= -90 && yaw < -45)
    return { primaryDir: { x: 1, z: 0 }, secondaryDir: { x: 0, z: 1 } };
  if (yaw >= -45 && yaw < 0)
    return { primaryDir: { x: 0, z: 1 }, secondaryDir: { x: 1, z: 0 } };
  if (yaw >= 0 && yaw < 45)
    return { primaryDir: { x: 0, z: 1 }, secondaryDir: { x: -1, z: 0 } };
  if (yaw >= 45 && yaw < 90)
    return { primaryDir: { x: -1, z: 0 }, secondaryDir: { x: 0, z: 1 } };
  if (yaw >= 90 && yaw < 135)
    return { primaryDir: { x: -1, z: 0 }, secondaryDir: { x: 0, z: -1 } };
  if (yaw >= 135 && yaw < 180)
    return { primaryDir: { x: 0, z: -1 }, secondaryDir: { x: -1, z: 0 } };

  //default
  return { primaryDir: { x: 1, z: 0 }, secondaryDir: { x: 0, z: 1 } };
}
function getDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.z - pos1.z) ** 2);
}

function strafeToPosition(pos) {

  const player = Player.getPlayer();
  let currentPos = player.getPos();
  let dir = getPlayerDirection();
  // walk to the tree while swinging
  while ((getDistance(currentPos, pos) > 0.3) && isRunning(botname)) {
    player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.8, currentPos.z + dir.primaryDir.z);
    KeyBind.keyBind('key.left', true);

    Client.waitTick(1);
    if (!isRunning(botname))
      return;
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.left', false);
}

function goToPosition(pos) {

  const player = Player.getPlayer();
  let currentPos = player.getPos();
  let dir = getPlayerDirection();
  // walk to the tree while swinging
  while ((getDistance(currentPos, pos) > 0.3) && isRunning(botname)) {
    player.lookAt(pos.x, pos.y + 0.5, pos.z);
    KeyBind.keyBind('key.forward', true);

    Client.waitTick(1);
    if (!isRunning(botname))
      return;
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.forward', false);
}

function doCocoaBreak() {
  const player = Player.getPlayer();
  const startingPos = getCenterPosition(player.getPos());
  let dir = getPlayerDirection();
  let waitTicks = 3;

  KeyBind.key("key.mouse.right", true);
  player.lookAt(startingPos.x + dir.primaryDir.x, startingPos.y - 0.5, startingPos.z + dir.primaryDir.z);
  Client.waitTick(waitTicks);
  player.lookAt(startingPos.x + dir.primaryDir.x, startingPos.y, startingPos.z + dir.primaryDir.z);
  Client.waitTick(waitTicks);
  player.lookAt(startingPos.x + dir.primaryDir.x, startingPos.y + 1, startingPos.z + dir.primaryDir.z);
  Client.waitTick(waitTicks);
  player.lookAt(startingPos.x + dir.primaryDir.x, startingPos.y + 2, startingPos.z + dir.primaryDir.z);
  Client.waitTick(waitTicks);
  KeyBind.key("key.mouse.right", false);

}

function doCocoaRow() {
  const player = Player.getPlayer();


  let rowStartingPos = getCenterPosition(player.getPos());
  let dir = getPlayerDirection();
  let startingPos = getCenterPosition(player.getPos());
  let goalPos = { ...rowStartingPos };
  goalPos.x -= dir.primaryDir.z * farmLength;
  goalPos.z -= dir.primaryDir.x * farmLength;
  while ((getDistance(startingPos, goalPos) > 0.3) && isRunning(botname)) {
    let strafePos = { x: startingPos.x - dir.primaryDir.z, y: startingPos.y, z: startingPos.z - dir.primaryDir.x }
    strafeToPosition(strafePos);
    doCocoaBreak();
    startingPos = getCenterPosition(player.getPos());
  }
  // turn around...
  player.lookAt(startingPos.x - dir.primaryDir.x, startingPos.y + 2, startingPos.z - dir.primaryDir.z);
  rowStartingPos = getCenterPosition(player.getPos());
  dir = getPlayerDirection();
  startingPos = getCenterPosition(player.getPos());
  goalPos = { ...rowStartingPos };
  goalPos.x -= dir.primaryDir.z * farmLength;
  goalPos.z -= dir.primaryDir.x * farmLength;
  while ((getDistance(startingPos, goalPos) > 0.3) && isRunning(botname)) {
    let strafePos = { x: startingPos.x - dir.primaryDir.z, y: startingPos.y, z: startingPos.z - dir.primaryDir.x }
    doCocoaBreak();
    strafeToPosition(strafePos);
    startingPos = getCenterPosition(player.getPos());
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const player = Player.getPlayer();


toggleGlobalVar(botname);

while (isRunning(botname)) {
  // doCocoaBreak();


  // Chat.log(getPlayerDirection());
  for (let i = 0; i < farmRows; i++) {
    doCocoaRow();
    let goalPos = getCenterPosition(player.getPos());
    let dir = getPlayerDirection();
    goalPos.x += dir.primaryDir.x * 4;
    goalPos.z += dir.primaryDir.z * 4;
    goToPosition(goalPos);
    let goalLookPos = getCenterPosition(player.getPos());
    dir = getPlayerDirection();
    goalLookPos.x -= dir.primaryDir.x;
    goalLookPos.z -= dir.primaryDir.z;
    goalLookPos.y += 0.8;
    player.lookAt(goalLookPos.x, goalLookPos.y, goalLookPos.z);
  }
  GlobalVars.putBoolean(botname, false);
  Client.waitTick(1);
  if (!isRunning(botname)) {
    cleanup(botname);
  }
}
