for (let ctx of JsMacros.getOpenContexts()) {
  if (ctx.getFile().getName() !== "exit_script.js") {
    ctx.closeContext();
  }
}
KeyBind.keyBind('key.forward', false);
KeyBind.keyBind('key.left', false);
KeyBind.keyBind('key.right', false);
KeyBind.key('key.keyboard.space', false);
KeyBind.key("key.mouse.right", false);
KeyBind.key("key.mouse.left", false);
Hud.clearDraw3Ds();
Hud.clearDraw2Ds();
Chat.log("Exited all scripts");
