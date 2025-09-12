const botname = "XenosVinesBot";
const farmLength = 101;
// let farmLength = 5;
// const farmRows = 2;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const { toggleGlobalVar, isRunning, cleanup } = require('./lib/scriptUtils.js');

const { getDistance, getCenterPosition, getPlayerDirection } = require('./lib/vectorUtils.js');

function gotoCenter() {
  const player = Player.getPlayer();
  const yaw = player.getYaw();
  const pitch = player.getPitch();
  let currentPos = player.getPos();
  const currentCenterPos = getCenterPosition(currentPos);
  while ((getDistance(currentPos, currentCenterPos) > 0.3) && isRunning(botname)) {
    player.lookAt(currentCenterPos.x, currentCenterPos.y, currentCenterPos.z);
    KeyBind.keyBind('key.sneak', true);
    KeyBind.keyBind('key.forward', true);

    Chat.log(getDistance(currentPos, currentCenterPos));
    Client.waitTick(1);
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.sneak', false);
  KeyBind.keyBind('key.forward', false);
  player.lookAt(yaw, pitch);
  Client.waitTick(1);
}

function strafeToPosition(pos) {

  const player = Player.getPlayer();
  let currentPos = player.getPos();
  const dir = getPlayerDirection();
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

function doVineColumn(dir) {

  const player = Player.getPlayer();
  const currentYaw = player.getYaw();

  // player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
  player.lookAt(currentYaw, 27);

  KeyBind.key("key.mouse.left", true);
  Client.waitTick(40);
  KeyBind.key("key.mouse.left", false);
}

function doVineRow(dir) {
  const player = Player.getPlayer();
  gotoCenter();
  doVineColumn(dir);
  for (let i = 0; i < farmLength && isRunning(botname); i++) {
    const currentPos = player.getPos();
    const currentCenterPos = getCenterPosition(currentPos);
    const goalPos = { ...currentCenterPos };
    goalPos.x += dir.secondaryDir.x;
    goalPos.z += dir.secondaryDir.z;
    strafeToPosition(goalPos);
    doVineColumn(dir);
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

toggleGlobalVar(botname);
if (isRunning(botname)) {
  // const player = Player.getPlayer();
  const dir = getPlayerDirection();
  doVineRow(dir);
  // gotoCenter();
  GlobalVars.putBoolean(botname, false);
  Client.waitTick(1);
  cleanup(botname);
}
