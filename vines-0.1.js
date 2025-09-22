const botname = "XenosVinesBot";
const farmLength = 32;
const farmLevels = 3;
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
  while ((getDistance(currentPos, currentCenterPos) > 0.2) && isRunning(botname)) {
    player.lookAt(currentCenterPos.x, currentCenterPos.y, currentCenterPos.z);
    KeyBind.keyBind('key.sneak', true);
    KeyBind.keyBind('key.forward', true);

    Client.waitTick(1);
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.sneak', false);
  KeyBind.keyBind('key.forward', false);
  player.lookAt(yaw, pitch);
  Client.waitTick(20);
}

function strafeToPosition(pos, dir) {
  // where is the player leaning towards?
  let leaning = "";
  if (dir.primaryDir.x != 0 && dir.primaryDir.x == dir.secondaryDir.z) leaning = "right";
  if (dir.primaryDir.x != 0 && dir.primaryDir.x != dir.secondaryDir.z) leaning = "left";
  if (dir.primaryDir.z != 0 && dir.primaryDir.z != dir.secondaryDir.x) leaning = "right";
  if (dir.primaryDir.z != 0 && dir.primaryDir.z == dir.secondaryDir.x) leaning = "left";


  const player = Player.getPlayer();
  let currentPos = player.getPos();
  while ((getDistance(currentPos, pos) > 0.4) && isRunning(botname)) {
    player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
    KeyBind.keyBind(`key.${leaning}`, true);

    Client.waitTick(1);
    if (!isRunning(botname))
      return;
    currentPos = player.getPos();
  }
  KeyBind.keyBind(`key.${leaning}`, false);
}

function climbLadder(dir) {

  // where is the player leaning towards?
  let leaning = "";
  if (dir.primaryDir.x != 0 && dir.primaryDir.x == dir.secondaryDir.z) leaning = "right";
  if (dir.primaryDir.x != 0 && dir.primaryDir.x != dir.secondaryDir.z) leaning = "left";
  if (dir.primaryDir.z != 0 && dir.primaryDir.z != dir.secondaryDir.x) leaning = "right";
  if (dir.primaryDir.z != 0 && dir.primaryDir.z == dir.secondaryDir.x) leaning = "left";

  let leaningOther = "right";
  if (leaning == "right") leaningOther = "left";

  gotoCenter();
  KeyBind.keyBind(`key.${leaning}`, true);

  Client.waitTick(50);
  KeyBind.keyBind(`key.${leaning}`, false);
  KeyBind.keyBind(`key.${leaningOther}`, true);
  Client.waitTick(13);
  KeyBind.keyBind(`key.${leaningOther}`, false);

}

function doVineColumn(dir) {

  const player = Player.getPlayer();
  const currentYaw = player.getYaw();

  // player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
  player.lookAt(currentYaw, 27);

  KeyBind.key("key.mouse.left", true);
  Client.waitTick(50);
  KeyBind.key("key.mouse.left", false);
}

function doVineRow(dir) {
  const player = Player.getPlayer();
  gotoCenter();
  let currentPos = player.getPos();
  player.lookAt(currentPos.x + dir.primaryDir.x, currentPos.y + 1.6, currentPos.z + dir.primaryDir.z);
  doVineColumn(dir);
  for (let i = 0; i < farmLength - 1 && isRunning(botname); i++) {
    currentPos = player.getPos();
    const currentCenterPos = getCenterPosition(currentPos);
    const goalPos = { ...currentCenterPos };
    goalPos.x += dir.secondaryDir.x;
    goalPos.z += dir.secondaryDir.z;
    strafeToPosition(goalPos, dir);
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
  for (let level = 0; level < farmLevels - 1; level++) {
    gotoCenter();
    climbLadder(dir);
    dir.secondaryDir.x *= -1;
    dir.secondaryDir.z *= -1;
    doVineRow(dir);
  }
  GlobalVars.putBoolean(botname, false);
  Client.waitTick(1);
  cleanup(botname);
}
