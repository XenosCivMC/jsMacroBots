# Exchange Updater

This Script can automatically update the available trades at an exchange.

You can do so by adding the exchangeUpdaterService.js as a service in JSMacro.
Then, with /cti mode enabled, click on every chest you want to track.
When you open the GUI via the exchangeUpdaterKeybinding.js (add this within JSMacro as a keybinding), you will see
every trade.

With the button "copy" the text is getting copied to your clipboard so you can paste it to discord yourself.
With the button "Send it to Discord" you can automatically post it. For this to work you need to configure a Discord
Webhook. You can do so via the channel settings->integration->webhooks. just add the webhook there, give it a name and
copy the url and paste it in the service script under DISCORD_WEBHOOK_URL.

another option is the "include out of stock" checkbox. If this is set, the trade with 0 available trades will be
included in the final text. When the Checkbox is not checked, these entries will be removed.


If you have any questions, comments or anything else, please contact Xenos in the Discord or open an issue here!

Known bug: there might be some issues with screen size and gui-scale. I play on FullHD and a 2x gui-scale. If the
gui scale is set to higher values, the menu might not work.
