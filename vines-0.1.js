let botname = "XenosVinesBot";
let farmLength = 101;
// let farmLength = 5;
let farmRows = 2;

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
    player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
    KeyBind.keyBind('key.left', true);

    Client.waitTick(1);
    if (!isRunning(botname))
      return;
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.left', false);
}

function doVineRow(dir) {
  const player = Player.getPlayer();
  let currentPos = player.getPos();
  let currentCenterPos = getCenterPosition(currentPos);
  let goalPos = { ...currentCenterPos };
  goalPos.x += dir.secondaryDir.x;
  goalPos.z += dir.secondaryDir.z;
  player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
  strafeToPosition(goalPos);
  for (let i = 0; i < farmLength && isRunning(botname); i++) {
    Chat.log(i);
    currentPos = player.getPos();
    currentCenterPos = getCenterPosition(currentPos);
    goalPos = { ...currentCenterPos };
    goalPos.x += dir.secondaryDir.x;
    goalPos.z += dir.secondaryDir.z;
    player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
    KeyBind.key("key.mouse.left", true);
    Client.waitTick(40);
    strafeToPosition(goalPos);


  }
  KeyBind.key("key.mouse.left", false);


}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

toggleGlobalVar(botname);
if (isRunning(botname)) {
  const player = Player.getPlayer();
  let dir = getPlayerDirection();
  doVineRow(dir);
  GlobalVars.putBoolean(botname, false);
  Client.waitTick(1);
  cleanup(botname);
}
