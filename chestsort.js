const listener = JsMacros.on(
  "OpenContainer",
  JavaWrapper.methodToJavaAsync((evt) => {
    const inv = evt.inventory;
    if (!inv.isContainer()) return;
    Hud.getOpenScreen().addButton(
      545,
      143,
      14,
      14,
      "S",
      JavaWrapper.methodToJava(() => sortContainer(inv))
    );
  })
);

/**
 *
 * @param {Inventory} inv
 */
const sortContainer = (inv) => {
  const slotCount = inv.getSlots("container").length;
  if (isInventoryEmpty(inv, slotCount)) {
    inv.close();
    return Chat.log("Container is empty.");
  }

  groupItems(inv, slotCount);
  bubbleOutEmptySlots(inv, slotCount);

  const maxIndex = inv.findItem("minecraft:air")[0];
  for (let i = 0; i < maxIndex; i++) {
    let min = i;
    for (let j = i + 1; j < maxIndex; j++) {
      if (getItemId(inv.getSlot(j), true).localeCompare(getItemId(inv.getSlot(min), true)) === -1) min = j;
    }
    if (min !== i) {
      inv.click(i);
      inv.click(min);
      inv.click(i);
    }
  }

  shiftItemRemaindersToEndOfGroup(inv, slotCount);
};

/**
 *
 * @param {Inventory} inv
 * @param {number} slotCount
 */
const groupItems = (inv, slotCount) => {
  const groupableItems = getGroupableItems(inv, slotCount);
  for (const item of groupableItems) {
    const positions = inv.findItem(item);
    for (const i in [...positions]) {
      const slot = inv.getSlot(positions[i]);
      if (slot.getCount() === slot.getMaxCount()) continue;
      const hadHeldItem = getItemId(inv.getHeld()) !== "minecraft:air";
      inv.click(positions[i]);
      if (hadHeldItem) inv.click(positions[i]);
    }
    inv.click(inv.findItem("minecraft:air")[0]);
  }
};

/**
 *
 * @param {Inventory} inv
 * @param {number} slotCount
 */
const getGroupableItems = (inv, slotCount) => {
  const groupableItems = new Set();

  for (let i = 0; i < slotCount; i++) {
    const slot = inv.getSlot(i);
    if (slot.getMaxCount() > 1) {
      groupableItems.add(getItemId(slot));
    }
  }

  groupableItems.delete("minecraft:air");

  return [...groupableItems];
};

/**
 *
 * @param {Inventory} inv
 * @param {number} slotCount
 */
const bubbleOutEmptySlots = (inv, slotCount) => {
  let bubbleSize = 0;
  for (let i = slotCount - 1; i >= 1; i--) {
    if (!inv.getSlot(i).isEmpty()) {
      bubbleSize++;
      let j = i;
      while (j > 0 && inv.getSlot(j - 1).isEmpty()) {
        for (let x = j; x < j + bubbleSize; x++) {
          inv.click(x);
          inv.click(x - 1);
        }
        j--;
      }
    }
  }
};

/**
 *
 * @param {Inventory} inv
 * @param {number} slotCount
 */
const shiftItemRemaindersToEndOfGroup = (inv, slotCount) => {
  // assumes items have already been grouped and there is only one stack that contains less than maximum count/maximum stack of that item
  const groupableItems = getGroupableItems(inv, slotCount);
  for (const item of groupableItems) {
    const positions = inv.findItem(item);
    let remainderPosition;
    for (const position of positions) {
      const slot = inv.getSlot(position);
      if (slot.getCount() !== slot.getMaxCount()) {
        remainderPosition = position;
        break;
      }
    }

    const lastPosition = positions[positions.length - 1];
    if (remainderPosition !== lastPosition && remainderPosition !== undefined) {
      inv.click(lastPosition);
      inv.click(remainderPosition);
      inv.click(lastPosition);
    }
  }
};

/**
 *
 * @param {Inventory} inv
 * @param {number} slotCount
 */
const isInventoryEmpty = (inv, slotCount) => {
  let empty = true;
  let i = 0;
  while (i < slotCount && empty) {
    if (!inv.getSlot(i).isEmpty()) empty = false;
    i++;
  }
  return empty;
};

/**
 *
 * @param {ItemStackHelper} item
 */
const getItemId = (item, withoutNamespace = false) => {
  const id = item.getItemId().toString();
  if (!withoutNamespace) return id;
  return id.split(":").slice(1).join(":");
};

event.stopListener = JavaWrapper.methodToJava(() => JsMacros.off(listener));
