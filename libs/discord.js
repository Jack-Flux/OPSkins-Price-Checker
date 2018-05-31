const Discord = require('discord.js');

class Client  {
  constructor(token, channels) {
    this.token = token;
    this.channels = channels;
    this.client = new Discord.Client();
    this.logged = false;
  }
  login() {
    return new Promise((resolve) => {
      this.client.login(this.token);
      this.client.on('ready', () => {
        if (this.channels.notifications) {
          this.notification('Bot started');
        }
        resolve();
      });
    })
  }
  pluginCommands() {
    this.client.channels.get(this.channels.notifications).send({
      embed: {
        title: 'Tradebot Commands',
        timestamp: new Date(),
        fields: [
          {
            name: '!update',
            value: 'Updates the bots pricelist for opskins items'
          },
          {
            name: '!search (optional profit %)',
            value: 'Searches opskins for profitable swing trades (default 2)',
          },
          {
            name: '!minimum [price]',
            value: 'Sets the minimum price required for items [default 150.00]',
          },
        ],
      }
    });
  }
  notification(text) {
    this.client.channels.get(this.channels.notifications).send({
      embed: {
        title: text,
        timestamp: new Date(),
      }
    });
  }
  itemData(data) {
    this.client.channels.get(this.channels.notifications).send({
      embed: {
        title: data.item_name,
        url: encodeURI(`http://opskins.com/?loc=shop_search&app=730_2&search_item=${data.item_name}&sort=lh`),
        thumbnail: {
          url: data.img,
        },
        description: `Hold: $${(data.hold / 100).toFixed(2)}\nNo hold: $${(data.no_hold / 100).toFixed(2)}\nProfit: ${data.profit}%`,
        timestamp: new Date(),
        footer: {
          text: 'Including fees',
        }
      }
    });
  }
}

module.exports = Client;