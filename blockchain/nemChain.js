/** 
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const request = require('request-promise');
class NemChain {

  constructor(blockchainConfig) {
    this.config = blockchainConfig;
  }

  /**
   * 
   * @param {String} address 
   * 
   * @memberOf WavesChain
   */
  async registerAccount(address) {
    await request({
      url: `http://localhost:${this.config.getRestPort()}/addr/`,
      method: 'POST',
      json: {address: address}
    });
  }

  /**
   * 
   * 
   * @param {String} address 
   * @return {Number}
   * 
   * @memberOf WavesChain
   */
  async getBalance(address) {
    const content = await request({
      url: `http://localhost:${this.config.getRestPort()}/addr/${address}/balance`,
      method: 'GET',
      json: true
    });

    return content.balance.confirmed.value;
  }

  /**
   * 
   * 
   * @param {Object} message 
   * @return {Number}
   * 
   * @memberOf WavesChain
   */
  async getBalanceFromMessage(message) {
    return message.balance.confirmed.value;
  }

  /**
   * 
   * 
   * @param {String} addrFrom 
   * @param {String} addrTo 
   * @param {Number} amount 
   * 
   * @return {models/Tx} Tx
   * 
   * @memberOf WavesChain
   */
  async sendTransferTransaction(addrFrom, addrTo, amount) {
    const transferData = {
      amount,
      "recipient": addrTo,
      "recipientPublicKey": "",
      "isMultisig": false,
      "timeStamp": Date.now(),
      "multisigAccount": "",
      "message": "Hello",
      "messageType": 1,
      "mosaics": [] 
    };

    const signTx = await request({
      url: `${this.config.getSignUrl()}/sign/nem/${addrFrom}`,
      method: 'POST',
      json: transferData
    });

    return await request({
      url: `http://localhost:${this.config.getRestPort()}/tx/send`,
      method: 'POST',
      json: signTx
    });
  }


    /**
   * 
   * 
   * @param {String} address 
   * @return {Number}
   * 
   * @memberOf WavesChain
   */
  async getTokenBalance(address, tokenName) {
    const token = this.prepareToken(tokenName);
    const content = await request({
      url: `http://localhost:${this.config.getRestPort()}/addr/${address}/balance`,
      method: 'GET',
      json: true
    });

    return content.mosaics[token.name].confirmed.value;
  }

  /**
   * 
   * 
   * @param {Object} message 
   * @return {Number}
   * 
   * @memberOf WavesChain
   */
  async getTokenBalanceFromMessage(message, tokenName) {
    const token = this.prepareToken(tokenName);
    return message.mosaics[token.name].confirmed.value;
  }

  prepareToken(token) {
    const parts = token.split('@');
    return {
      namespaceId: token[0],
      name: token[1]
    };
  }

    /**
   * 
   * 
   * @param {String} addrFrom 
   * @param {String} addrTo 
   * @param {Number} amount 
   * 
   * @return {models/Tx} Tx
   * 
   * @memberOf WavesChain
   */
  async sendTokenTransaction(addrFrom, addrTo, tokenName, amount) {
    const token = this.prepareToken(tokenName);


    const transferData = {
      amount: 0,
      "recipient": addrTo,
      "recipientPublicKey": "",
      "isMultisig": false,
      "timeStamp": Date.now(),
      "multisigAccount": "",
      "message": "Hello",
      "messageType": 1,
      "mosaics": [
        {
          mosaicId: {
            namespaceId: token.namespace,
            name: token.name
          },
          quantity: amount
        }
      ] 
    };

    const signTx = await request({
      url: `${this.config.getSignUrl()}/sign/nem/${addrFrom}`,
      method: 'POST',
      json: transferData
    });

    return await request({
      url: `http://localhost:${this.config.getRestPort()}/tx/send`,
      method: 'POST',
      json: signTx
    });
  }

  /**
   * 
   * @param {Object} contentTx 
   * @return {Boolean}
   * 
   * @memberOf WavesChain
   */
  async checkUnconfirmedTx(contentTx) {
    return contentTx.blockNumber == -1;
  }

  /**
   * 
   * @param {Object} contentTx 
   * @return {Boolean}
   * 
   * @memberOf WavesChain
   */
  async checkConfirmedTx(contentTx) {
    return contentTx.blockNumber > 0;
  }


}

module.exports = NemChain;
