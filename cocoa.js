var botname = "XenosCocoaBot";

const yLimit = 93;
const columnPositions = [
  { x: -2274, y: -4, z: -16203 },
  // { x: -2300, y: -8, z: -16230 },
  // { x: -2299, y: -8, z: -16228 },
  // { x: -2302, y: -8, z: -16229 },
];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO NOT TOUCH
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const globalTickWait = 5;

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

function isRunning(botname) {
  return GlobalVars.getBoolean(botname);
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

function getDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.z - pos1.z) ** 2);
}

function getCenterPosition(position) {
  var newPos = {
    x: Math.floor(position.x) + 0.5,
    y: Math.floor(position.y) + 0.5,
    z: Math.floor(position.z) + 0.5
  };

  return newPos;
}

function goto(pos) {
  const goalPosition = getCenterPosition(pos);
  const player = Player.getPlayer();
  let currentPos = player.getPos();
  while ((getDistance(currentPos, goalPosition) > 0.1) && isRunning(botname)) {
    KeyBind.keyBind('key.forward', true);
    player.lookAt(goalPosition.x, goalPosition.y + 0.5, goalPosition.z);

    Client.waitTick(globalTickWait);
    if (!isRunning(botname))
      return;
    currentPos = player.getPos();
  }
  KeyBind.keyBind('key.forward', false);
}

function doCocoaColumn(pos) {
  const player = Player.getPlayer();
  ["north", "east", "west", "south"].forEach(direction => {

    if (!isRunning(botname))
      return;
    goto(pos);
    if (!isRunning(botname))
      return;
    Client.waitTick(globalTickWait);
    KeyBind.keyBind('key.jump', true);
    Client.waitTick(1);
    KeyBind.keyBind('key.jump', false);
    Client.waitTick(globalTickWait);
    player.lookAt(direction);
    Client.waitTick(20);
    // KeyBind.keyBind('key.jump', true);
    // Client.waitTick(3);
    // KeyBind.keyBind('key.jump', false);
    // KeyBind.keyBind('key.sneak', true);
    // Client.waitTick(20);
    KeyBind.keyBind('key.forward', true);
    Client.waitTick(4); // untill you sneak to the end
    KeyBind.keyBind('key.forward', false);
    KeyBind.keyBind('key.backwards', true);
    Client.waitTick(globalTickWait);
    KeyBind.keyBind('key.forward', true);
    KeyBind.keyBind('key.backwards', false);
    Client.waitTick(1); // just a little jump down the block
    KeyBind.keyBind('key.forward', false);
    Client.waitTick(globalTickWait);
    KeyBind.keyBind('key.sneak', true);
    KeyBind.keyBind('key.forward', true);
    Client.waitTick(15); // untill you sneak to the end
    KeyBind.keyBind('key.forward', false);
    player.lookAt(player.getFacingDirection().getOpposite().getName());
    player.lookAt(player.getYaw(), 80);
    Client.waitTick(globalTickWait);
    Client.waitTick(globalTickWait);
    if (!isRunning(botname))
      return;
    KeyBind.key("key.mouse.right", true);

    while (player.getPos().y > yLimit) {

      Client.waitTick(globalTickWait);
      if (!isRunning(botname))
        return;
    }
    KeyBind.key("key.mouse.right", false);
    KeyBind.keyBind('key.sneak', false);
  });
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAIN LOOP
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


toggleGlobalVar(botname);

while (isRunning(botname)) {
  // columnPositions.forEach(columnPos => {
  //   if (!isRunning(botname))
  //     return;
  //   doCocoaColumn(columnPos);
  // });
  const player = Player.getPlayer();
  const pos = player.getPos();
  pos.y += -1;
  doCocoaColumn(pos);
  GlobalVars.putBoolean(botname, false);
  Client.waitTick(globalTickWait);
  if (!isRunning(botname)) {
    cleanup(botname);
  }
}
