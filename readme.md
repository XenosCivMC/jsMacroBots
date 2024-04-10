# Xenos jsMacro Minecraft Bots

This is a testing repo for various Minecraft Bots written in javascript for the jsMacroMod. The Bots are written specifically for the CivMC Server. This is a bleeding edge alpha version with many bugs.

## Installation

You can just clone this repo and add the bot you want to use to a keybind. The scripts currently working are described below.
Most bots are toggleable - this means the first execute should start the bot and the next execute (via keybind) should stop it. Sometimes this takes a little while, as sometimes the last activity still has to be completed.

Most bots have configuration options at the beginning of the file. Do not edit anything below the "DO NOT TOUCH" Marker.

## Itemsaver

itemsaver.js

this is not a bot. It is a EventHandler (for the ItemDamage Event) which ensures to switch your tool to a tool with durability.
Works great with other bots.

## Woodcutter

woodcutter.js.

start at the first tree location (you probably have to cut the first tree by hand).
look slightly in the direction you want to go.
the variables farmLength and farmWidth states how many trees there are in each direction.
you can also play with the chopTime variable, this changes with axe type. for stone tools this should be roughly 21.
if "treeType" is set to anything other than "birch", the bot does a little jump when cutting larger trees like spruce.
also this bot occasionally drops resouces into the water. It keeps the hotbar.
