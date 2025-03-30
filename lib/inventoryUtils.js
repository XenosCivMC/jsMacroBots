
/**
 * swaps the given item to the selected hotbar slot.
 */
function selectItem(itemName, fuzzy, damageThreshold) {
  const inv = Player.openInventory();
  const selectedHotbarSlot = inv.getSelectedHotbarSlotIndex();
  const heldSlot = 36 + selectedHotbarSlot;
  const heldItem = inv.getSlot(heldSlot);

  // no movement!
  KeyBind.keyBind('key.forward', false);
  KeyBind.keyBind('key.jump', false);
  KeyBind.keyBind('key.sneak', false);
  if (fuzzy === undefined)
    fuzzy = true;

  var heldDamage = heldItem.getMaxDamage() - heldItem.getDamage();
  // if item is already in hand do nothing
  if (heldItem.getItemID().includes(itemName)) {
    if (!damageThreshold || heldDamage > damageThreshold)
      return;
  }

  // iterate every inventory slot
  for (var i = 0; i <= 44; i++) {
    var currentItem = inv.getSlot(i);
    var currentItemID = currentItem.getItemID();
    if (currentItemID.includes(itemName)) {
      var curDamage = currentItem.getMaxDamage() - currentItem.getDamage();
      if (!damageThreshold || curDamage > damageThreshold)
        inv.swapHotbar(i, selectedHotbarSlot);
    }
  }
}

/**
  * Drops specific resources on the ground (or in a water drop chute)
  */
function dropResources(droppedResources, keepHotbar) {
  const inv = Player.openInventory();

  // iterate every inventory slot
  var lastIteratedSlot = 45;
  if (keepHotbar)
    lastIteratedSlot = 35;
  for (var i = 0; i <= lastIteratedSlot; i++) {
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
  * Drops specific resources on the ground (or in a water drop chute)
  */
function freeInventorySlots() {
  const inv = Player.openInventory();

  var counter = 0;
  // iterate every inventory slot
  for (var i = 9; i <= 44; i++) {
    // Chat.log(inv.getSlot(i).getName().getString());
    if (inv.getSlot(i).getName().getString() == "Air") {
      counter++;
    }
  }
  return counter;
}

module.exports = {
  selectItem,
  dropResources,
  freeInventorySlots
}
