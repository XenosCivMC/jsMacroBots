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
 *
 */
function execToggleBot(config) {

  toggleGlobalVar(config.botname);

  if (config.onExec && isRunning(config.botname)) {
    config.onExec();
  }

  if (config.onLoop) {
    while (isRunning(config.botname)) {
      Client.waitTick(1);
      config.onLoop();
      if (!isRunning(config.botname)) {
        if (config.onDisable) config.onDisable();
        cleanup(config.botname);
      }
    }
  } else if (!isRunning(config.botname)) {
        if (config.onDisable) config.onDisable();
        cleanup(config.botname);
  }
}


/**
  * Runs after the script is finished or toggled (via hotkey)
  */
function cleanup(botname) {
  if (!botname) botname = "";

  KeyBind.keyBind('key.sneak', false);
  KeyBind.key("key.mouse.right", false);
  KeyBind.key("key.mouse.left", false);
  KeyBind.keyBind('key.forward', false);
  KeyBind.keyBind('key.jump', false);

  // Because of timings the chat message is done here and not in toggleGlobalVar()
  Chat.log(Chat.createTextBuilder().append("[").withColor(0x7)
    .append(botname).withColor(0x5)
    .append("]").withColor(0x7).append(" disabled").withColor(0xc)
    .build());
}

/**
  * Syntactic sugar for checking a GlobalVar Boolean.
  * See toggleGlobalVar(botname)
  */
function isRunning(botname) {
  return GlobalVars.getBoolean(botname);
}

module.exports = {
  toggleGlobalVar,
  cleanup,
  isRunning,
  execToggleBot: execToggleBot
}
