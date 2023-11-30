/*
 * @Author: lijunwei
 * @Date: 2022-01-06 14:43:04
 * @LastEditTime: 2022-01-10 16:43:02
 * @LastEditors: lijunwei
 * @Description: 
 */

import sass from "sass";
import CleanCSS from "clean-css";
import { writeFileSync } from "fs";

import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function compileBootstrap(cssFilePath, param) {
  const startStamp = new Date().getTime();
  
  const { colorChange } = param;
  console.log('========================')
  console.log(colorChange);
console.log(cssFilePath)
  const customVariablesPath = path.resolve(__dirname, "../bootstrap/scss/_custom-variables.scss");
  writeFileSync(customVariablesPath, `$primary: ${colorChange};`)
  
  const bootstrapSourceCodePath = path.resolve(__dirname, "../bootstrap/scss/bootstrap.scss");

  const rlt = sass.compile(bootstrapSourceCodePath);
  const compiledStamp = new Date().getTime();
  console.log(`--------------------------`)
  console.log(`Sass compiler cost  :${compiledStamp - startStamp} ms`)

  const { styles: minicss } = new CleanCSS().minify(rlt.css)
  // const minicss = new CleanCSS().minify(rlt.css)

  writeFileSync(cssFilePath, minicss);

  const rendStamp = new Date().getTime();
  console.log(`Render cost total   :${ rendStamp - compiledStamp } ms`)
  console.log(`Total cost          :${ rendStamp - startStamp } ms`)

}


