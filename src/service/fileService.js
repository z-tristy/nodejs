/*
 * @Author: lijunwei
 * @Date: 2022-01-07 11:48:45
 * @LastEditTime: 2022-01-10 15:04:20
 * @LastEditors: lijunwei
 * @Description: 
 */

import { readFileSync, writeFileSync } from "fs";


export function insertBeforeLine(filePath, text ,beforeLineNum = 0) {
  const data = readFileSync(filePath).toString().split("\n");
  data.splice(beforeLineNum, 0, text);
  const _text = data.join("\n");
  writeFileSync(filePath, _text);
}

export function insertAfterLine(filePath, text) {
  const data = readFileSync(filePath).toString().split("\n");
  data.push(text);
  const _text = data.join("\n");
  writeFileSync(filePath, _text);
}





