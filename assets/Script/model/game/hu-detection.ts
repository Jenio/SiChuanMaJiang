import { CardId, CardGroup, HuForm } from './concept';

/**
 * 数组去重，返回去重后的数组。
 * @param a 数组。
 */
function _unique<T>(a: Array<T>): T[] {
  return a.filter((item, idx, arr) => {
    return arr.indexOf(item) === idx;
  });
}

function _encode(card1: CardId, card2: CardId, card3: CardId) {
  return card1 * 10000 + card2 * 100 + card3;
}

function _decode(code: number): [CardId, CardId, CardId] {
  return [
    ~~(code / 10000),
    ~~(code % 10000 / 100),
    code % 100
  ];
}

function _addThree(set: { [key: number]: boolean }, card: CardId) {
  set[_encode(card, card, card)] = true;
  if (card === CardId.Tong1 || card === CardId.Suo1 || card === CardId.Wan1) {
    set[_encode(card, card + 1, card + 2)] = true;
  } else if (card === CardId.Tong2 || card === CardId.Suo2 || card === CardId.Wan2) {
    set[_encode(card - 1, card, card + 1)] = true;
    set[_encode(card, card + 1, card + 2)] = true;
  } else if (card === CardId.Tong8 || card === CardId.Suo8 || card === CardId.Wan8) {
    set[_encode(card - 2, card - 1, card)] = true;
    set[_encode(card - 1, card, card + 1)] = true;
  } else if (card === CardId.Tong9 || card === CardId.Suo9 || card === CardId.Wan9) {
    set[_encode(card - 2, card - 1, card)] = true;
  } else {
    set[_encode(card - 2, card - 1, card)] = true;
    set[_encode(card - 1, card, card + 1)] = true;
    set[_encode(card, card + 1, card + 2)] = true;
  }
}

/**
 * 检查给定的卡牌数组是否完全由顺子和刻子组成。
 * @param cards 卡牌数组。
 */
function _checkAllThree(cards: CardId[]): boolean {
  if (cards.length === 0) {
    return true;
  }
  if (cards.length % 3 !== 0) {
    return false;
  }
  let set: { [key: number]: boolean } = {};
  for (let c of _unique(cards)) {
    _addThree(set, c);
  }

  // 遍历所有可能的顺子和刻子。
  for (let code in set) {
    if (set[code]) {
      let [card1, card2, card3] = _decode(+code);
      if (card1 === card2) {  // 刻子。
        let idx1 = cards.indexOf(card1);
        if (idx1 < 0) {
          continue;
        }
        let idx2 = cards.indexOf(card2, idx1 + 1);
        if (idx2 < 0) {
          continue;
        }
        let idx3 = cards.indexOf(card3, idx2 + 1);
        if (idx3 < 0) {
          continue;
        }
        if (_checkAllThree(cards.filter((c, idx) => idx !== idx1 && idx !== idx2 && idx !== idx3))) {
          return true;
        }
      } else {  // 顺子。
        let idx1 = cards.indexOf(card1);
        if (idx1 < 0) {
          continue;
        }
        let idx2 = cards.indexOf(card2);
        if (idx2 < 0) {
          continue;
        }
        let idx3 = cards.indexOf(card3);
        if (idx3 < 0) {
          continue;
        }
        if (_checkAllThree(cards.filter((c, idx) => idx !== idx1 && idx !== idx2 && idx !== idx3))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * 检查给定的卡牌数组是否完全由刻子组成，如果给的卡牌数组长度为0，那么认为全由刻子组成（0个刻子）。
 * @param cards 卡牌数组。
 */
function _checkAllPeng(cards: CardId[]): boolean {
  if (cards.length === 0) {
    return true;
  }

  // 统计卡牌的数量。
  let cardCount: { [card: number]: number } = {};
  for (let card of cards) {
    let count = cardCount[card];
    if (count === undefined) {
      cardCount[card] = 1;
    } else {
      cardCount[card] = count + 1;
    }
  }

  for (let card in cardCount) {
    let count = cardCount[card];
    if (count !== undefined) {
      if (count !== 3) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 返回移除头后的卡牌数组。
 * @param cards 卡牌数组。
 * @param head 头。
 */
function _removeHead(cards: CardId[], head: CardId): CardId[] {
  let res = cards.slice();
  let count = 0;
  for (let n = res.length - 1; n >= 0; --n) {
    if (res[n] === head) {
      res.splice(n, 1);
      if (++count === 2) {
        break;
      }
    }
  }
  return res;
}

/**
 * 检测是否非七对的胡牌（通用检测法，性能较差）。
 * @param cards 手牌卡牌数组包含新抽的卡牌。
 */
export function checkNoneQiDuiHu(cards: CardId[]): boolean {
  if ((cards.length - 2) % 3 !== 0) {
    return false;
  }
  let mark = {};
  for (let n = 0; n < cards.length - 1; ++n) {
    let h = cards[n];
    for (let m = 0; m < cards.length; ++m) {
      if (h === cards[m] && !mark[h]) {  // 找到了一个头。
        mark[h] = true;
        if (_checkAllThree(_removeHead(cards, h))) {
          return true;
        }
        break;
      }
    }
  }
  return false;
}

/**
 * 检测胡的牌型，不包含清升级、天地升级。
 * @param cards 手牌卡牌数组包含新抽的卡牌。
 * @param cgs 牌组。
 */
function _checkHuFormWithoutQingTianDi(cards: CardId[], cgs: CardGroup[]): HuForm | undefined {

  // 按手牌张数检测。
  if (cards.length === 2) {

    // 手牌两张同名牌才可能胡。
    if (cards[0] !== cards[1]) {
      return undefined;
    }

    // 十八罗汉检测。
    // 如果牌组都是杠，那么就是十八罗汉。
    let shiBaLuoHan = true;
    for (let cg of cgs) {
      if (cg.t === 'peng') {
        shiBaLuoHan = false;
        break;
      }
    }
    if (shiBaLuoHan) {
      return HuForm.ShiBaLuoHan;
    }

    // 金钩钓检测。
    // 不是十八罗汉，那么就是金钩钓。
    return HuForm.JinGouDiao;

  } else if (cards.length === 5) {

    // 去掉对子后如果剩下的是刻子则为碰碰胡，如果剩下的是顺子则为平胡。
    for (let n = 0; n < 4; ++n) {
      let h = cards[n];
      for (let m = n + 1; m < 5; ++m) {
        if (h === cards[m]) {  // 找到了一个头。
          let body: CardId[] = [];
          for (let k = 0; k < 5; ++k) {
            if (k !== n && k !== m) {
              body.push(cards[k]);
            }
          }
          if (body[0] === body[1] && body[0] === body[2]) {
            return HuForm.PengPeng;
          }
          body.sort((a, b) => a - b);
          let [card1, card2, card3] = body;
          if (card1 >= CardId.Tong1 && card1 <= CardId.Tong7) {
            if (card2 === card1 + 1 && card3 === card2 + 1) {
              return HuForm.Ping;
            }
          } else if (card1 >= CardId.Suo1 && card1 <= CardId.Suo7) {
            if (card2 === card1 + 1 && card3 === card2 + 1) {
              return HuForm.Ping;
            }
          } else if (card1 >= CardId.Wan1 && card1 <= CardId.Wan7) {
            if (card2 === card1 + 1 && card3 === card2 + 1) {
              return HuForm.Ping;
            }
          }
          break;
        }
      }
    }

  } else if (cards.length === 8 || cards.length === 11) {

    // 去头后都是刻子则为碰碰胡。
    let mark = {};
    for (let n = 0; n < cards.length - 1; ++n) {
      let h = cards[n];
      for (let m = n + 1; m < cards.length; ++m) {
        if (h === cards[m] && !mark[h]) {  // 找到了一个头。
          mark[h] = true;
          if (_checkAllPeng(_removeHead(cards, h))) {
            return HuForm.PengPeng;
          }
          break;
        }
      }
    }

    // 去头后都是刻子或顺子则为平胡。
    mark = {};
    for (let n = 0; n < cards.length - 1; ++n) {
      let h = cards[n];
      for (let m = n + 1; m < cards.length; ++m) {
        if (h === cards[m] && !mark[h]) {  // 找到了一个头。
          mark[h] = true;
          if (_checkAllThree(_removeHead(cards, h))) {
            return HuForm.Ping;
          }
          break;
        }
      }
    }
  } else if (cards.length === 14) {

    // 检查是否都是对子，是否存在至少一个四子，如果都是对子，那么至少是七对胡，如果含有至少一个四子，那么是龙七对胡。
    let allPair = true;
    let existsFour = false;
    for (let n = 0; n < cards.length - 1; ++n) {
      let h = cards[n];
      let count = 0;
      for (let m = 0; m < cards.length; ++m) {
        if (h === cards[m]) {
          count++;
        }
      }
      if (count !== 2 && count !== 4) {
        allPair = false;
        break;
      }
      if (count === 4) {
        existsFour = true;
      }
    }
    if (allPair) {
      if (existsFour) {
        return HuForm.LongQiDui;
      } else {
        return HuForm.QiDui;
      }
    }

    // 去头后都是刻子则为碰碰胡。
    let mark = {};
    for (let n = 0; n < cards.length - 1; ++n) {
      let h = cards[n];
      for (let m = n + 1; m < cards.length; ++m) {
        if (h === cards[m] && !mark[h]) {  // 找到了一个头。
          mark[h] = true;
          if (_checkAllPeng(_removeHead(cards, h))) {
            return HuForm.PengPeng;
          }
          break;
        }
      }
    }

    // 去头后都是刻子或顺子则为平胡。
    mark = {};
    for (let n = 0; n < cards.length - 1; ++n) {
      let h = cards[n];
      for (let m = n + 1; m < cards.length; ++m) {
        if (h === cards[m] && !mark[h]) {  // 找到了一个头。
          mark[h] = true;
          if (_checkAllThree(_removeHead(cards, h))) {
            return HuForm.Ping;
          }
          break;
        }
      }
    }
  }

  return undefined;
}

/**
 * 检测胡的牌型，不包含天地升级。
 * @param cards 手牌卡牌数组包含新抽的卡牌。
 * @param cgs 牌组。
 */
function _checkHuFormWithoutTianDi(cards: CardId[], cgs: CardGroup[]): HuForm | undefined {
  let huForm = _checkHuFormWithoutQingTianDi(cards, cgs);
  if (huForm === undefined) {
    return undefined;
  }

  // 清一色升级检测。
  let card1 = cards[0];
  if (card1 >= CardId.Tong1 && card1 <= CardId.Tong9) {
    for (let n = 1; n < cards.length; ++n) {
      let card = cards[n];
      if (card < CardId.Tong1 || card > CardId.Tong9) {
        return huForm;
      }
    }
    for (let cg of cgs) {
      if (cg.cardId < CardId.Tong1 || cg.cardId > CardId.Tong9) {
        return huForm;
      }
    }
  } else if (card1 >= CardId.Suo1 && card1 <= CardId.Suo9) {
    for (let n = 1; n < cards.length; ++n) {
      let card = cards[n];
      if (card < CardId.Suo1 || card > CardId.Suo9) {
        return huForm;
      }
    }
    for (let cg of cgs) {
      if (cg.cardId < CardId.Suo1 || cg.cardId > CardId.Suo9) {
        return huForm;
      }
    }
  } else if (card1 >= CardId.Wan1 && card1 <= CardId.Wan9) {
    for (let n = 1; n < cards.length; ++n) {
      let card = cards[n];
      if (card < CardId.Wan1 || card > CardId.Wan9) {
        return huForm;
      }
    }
    for (let cg of cgs) {
      if (cg.cardId < CardId.Wan1 || cg.cardId > CardId.Wan9) {
        return huForm;
      }
    }
  }

  // 清升级。
  if (huForm === HuForm.ShiBaLuoHan) {
    return HuForm.QingShiBaLuoHan;
  } else if (huForm === HuForm.JinGouDiao) {
    return HuForm.QingJinGouDiao;
  } else if (huForm === HuForm.PengPeng) {
    return HuForm.QingPengPeng;
  } else if (huForm === HuForm.QiDui) {
    return HuForm.QingQiDui;
  } else if (huForm === HuForm.LongQiDui) {
    return HuForm.QingLongQiDui;
  }
  return HuForm.QingYiSe;
}

/**
 * 检测胡的牌型。
 * @param firstDraw 是否首轮抽牌，用于判定天胡或地胡（如果是放炮，此值填false）。
 * @param banker 是否庄，用于判定天胡或地胡。
 * @param cards 手牌卡牌数组包含新抽的卡牌。
 * @param cgs 牌组。
 */
export function checkHuForm(firstDraw: boolean, banker: boolean, cards: CardId[], cgs: CardGroup[]): HuForm | undefined {
  let huForm = _checkHuFormWithoutTianDi(cards, cgs);
  if (huForm === undefined) {
    return undefined;
  }

  if (firstDraw) {
    if (banker) {
      return HuForm.Tian;
    } else {
      return HuForm.Di;
    }
  }

  return huForm;
}