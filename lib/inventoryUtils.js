
/**
 * swaps the given item to the selected hotbar slot.
 */
function selectItem(itemName, fuzzy) {
  const inv = Player.openInventory();
  const selectedHotbarSlot = inv.getSelectedHotbarSlotIndex();
  const heldSlot = 36 + selectedHotbarSlot;
  const heldItem = inv.getSlot(heldSlot);

  if (fuzzy === undefined)
    fuzzy = true;

  // if item is already in hand do nothing
  if (heldItem.getItemID().includes(itemName)) {
    return;
  }

  // iterate every inventory slot
  for (var i = 0; i <= 44; i++) {

    var currentItemName = inv.getSlot(i).getItemID();
    // Chat.log(currentItemName);
    if (currentItemName.includes(itemName)) {
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
