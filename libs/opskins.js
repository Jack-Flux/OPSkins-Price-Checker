const request = require('request');
const EventEmitter = require('events');

class OPSkins extends EventEmitter {
  constructor(key, priceFilter = 15000, itemList = null) {
    super();
    this.key = key;
    this.api = 'https://api.opskins.com/';
    this.item_list = itemList || null;
    this.price_filter = priceFilter;
  }
  sleep(interval) {
    return new Promise((resolve) => setTimeout(resolve, interval));
  }
  updateItemList() {
    return new Promise((resolve) => {
      const url = `${this.api}/IPricing/GetAllLowestListPrices/v1/?appid=730`;
      request.get(url, (err, resp, body) => {
        if (err) {
          console.log(err);
          return;
        }
        this.item_list = JSON.parse(body).response;
        resolve();
      });
    });
  }
  filterItems() {
    return new Promise((resolve) => {
      const filtered = [];
      Object.keys(this.item_list).forEach((itemName) => {
        if (this.item_list[itemName].price > this.price_filter && !/Souvenir|Well-Worn|Sticker|Emerald|AUG|Tec-9|P250|MP7|EMS|StatTrak|Gloves|Hand/.test(itemName)) {
          filtered.push(itemName);
        }
      });
      resolve(filtered);
    });
  }
  searchQuery(item) {
    return new Promise((resolve) => {
      const url = `${this.api}/ISales/Search/v2/?app=730_2&search_item=${encodeURI(item)}&key=${this.key}`;
      request.get(url, (err, resp, body) => {
        if (err) {
          console.log(err);
          return;
        }
        const test = JSON.parse(body)
        if (!test.response || !test.response.sales){
          console.log(test);
        }
        resolve(JSON.parse(body).response);
      });
    });
  }
  async loopItems(items, profitReq, interval = 0, i = 0) {
    if (i >= items.length) {
      this.emit('finished');
      return;
    }
    const itemData = await this.searchQuery(items[i]);
    let hold = null;
    let noHold = null;
    itemData.sales.forEach((item) => {
      if (item.flags.trade_locked && (!hold || item.amount < hold)) {
        hold = item.amount;
      }
      else if (!item.flags.trade_locked && (!noHold || item.amount < noHold)) {
        noHold = item.amount;
      }
    });
    const profit = (noHold / hold * 100 - 105);
    if (hold && noHold && profit >= profitReq) {
      this.emit('item', {
        hold: hold,
        no_hold: noHold,
        img: itemData.sales[0].img,
        item_name: itemData.sales[0].market_hash_name,
        profit: profit.toFixed(2),
      });
    }
    await this.sleep(interval);
    this.loopItems(items, profitReq, interval, i += 1);
  }
  async searchItems(profitReq) {
    const filtered = await this.filterItems();
    this.loopItems(filtered, profitReq);
  }
}

module.exports = OPSkins;