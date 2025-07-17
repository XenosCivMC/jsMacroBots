
var threshold = 10;
const items = [
  "minecraft:golden_pickaxe",
  "minecraft:stone_axe",
  "minecraft:shears"
];

const SERVICE_NAME = event.serviceName;

const itemSaverEventHandler = function(event) {
  const item = event.item;
  // Chat.log(event.item)
  // Chat.log(event.oldItem)
  const itemName = event.item.getItemId().toLowerCase();
  if (items.includes(itemName)) {
    const curDamage = item.getMaxDamage() - item.getDamage();
    if (curDamage <= threshold) {
      // let player = Player.getPlayer();
      const inv = Player.openInventory();
      const curSlot = inv.getSelectedHotbarSlotIndex() + 36;
      for (const foundItemSlot of inv.findItem(itemName)) {
        if (foundItemSlot == curSlot)
          continue;
        const foundItem = inv.getSlot(foundItemSlot);
        const foundItemDmg = foundItem.getMaxDamage() - foundItem.getDamage();

        if (foundItemDmg <= threshold) {
          KeyBind.keyBind('key.forward', false);
          KeyBind.keyBind('key.jump', false);
          KeyBind.keyBind('key.sneak', false);
          inv.swap(curSlot, 1);
          Client.waitTick(5);
          inv.swap(foundItemSlot, 2);
          Client.waitTick(5);
          inv.swap(0, curSlot);
          Client.waitTick(5);
          return;
        }
      }
      // no item found: select a new one
      for (const foundItemSlot of inv.findItem(itemName)) {
        if (foundItemSlot == curSlot)
          continue;
        KeyBind.keyBind('key.forward', false);
        KeyBind.keyBind('key.jump', false);
        KeyBind.keyBind('key.sneak', false);
        inv.swap(curSlot, foundItemSlot);
      }

    }
  }
};



Chat.log(`STARTING ${SERVICE_NAME}`);
const listener = JsMacros.on('HeldItemChange', JavaWrapper.methodToJava(itemSaverEventHandler));

event.stopListener = JavaWrapper.methodToJava(() => { // clean up service
  JsMacros.off(listener);
  Chat.log(`${SERVICE_NAME} STOPPED.`);
});
