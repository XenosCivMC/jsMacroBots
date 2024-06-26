import js from "@eslint/js";
import globals from "globals";

var jsMacroGlobals = {
  GlobalVars: "readonly",
  Chat: "readonly",
  Client: "readonly",
  KeyBind: "readonly",
  Player: "readonly",
  event: "readonly",
  JavaWrapper: "readonly",
  JsMacros: "readonly",
};

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: { ...jsMacroGlobals, ...globals.node }
    },
    rules: {
      semi: "error",
      "prefer-const": "error"
    }
  }
];
