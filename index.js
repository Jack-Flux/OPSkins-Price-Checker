const config = require('./config.json');
const Discord = require('./libs/discord');
const OPSkins = require('./libs/opskins');

const discord = new Discord(config.discord.token, config.discord.channels);
const opskins = new OPSkins(config.opskins.api_key); // Minimum price filter (cents)

discord.login();

discord.client.on('message', async (msg) => {
  const [ command, parameter ] = msg.content.split(' ');
  switch(command) {
    case '!update':
      await opskins.updateItemList();
      discord.notification('OPSkins item list updated');
      break;
    case '!search':
      if (!opskins.item_list) {
        discord.notification('No OPSkins item list, try !update first');
        break;
      }
      opskins.searchItems(parseFloat(parameter) || 2);
      break;
    case '!minimum':
      opskins.price_filter = parseFloat(parameter) * 100 || 15000;
      discord.notification(`Mnimum price updated to ${(opskins.price_filter / 100).toFixed(2)}`);
      break;
    case '!help':
      discord.pluginCommands();
    default:
      break;
  }
});

opskins.on('error', (error) => discord.notification(error));
opskins.on('item', (item) => discord.itemData(item));
opskins.on('finished', () => discord.notification('Finished checking item list'));