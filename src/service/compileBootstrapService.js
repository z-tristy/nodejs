
import * as sass from 'sass'
import CleanCSS from "clean-css"
import { writeFileSync } from "fs"

import { fileURLToPath } from 'url'
import path,{ dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function compileBootstrap(cssFilePath, param) {
  const startStamp = new Date().getTime();
  
  const { general, utilities } = param;
  console.log('========================')
  console.log(general);
  console.log(utilities);
console.log(cssFilePath)

  // 处理 custom-variables
  const customVariablesPath = path.resolve(__dirname, "../custom-scss/styles/customize/_variables.scss");
  writeFileSync(customVariablesPath, '')
  if (general !== undefined) {
    writeFileSync(customVariablesPath, `${general}`)
  }

  const customUtilitiesPath = path.resolve(__dirname, "../custom-scss/styles/customize/_utilities.scss");
  writeFileSync(customUtilitiesPath, '')
  if (utilities !== undefined) {
    writeFileSync(customUtilitiesPath, `${utilities}`)
  }
  
  const bootstrapSourceCodePath = path.resolve(__dirname, "../custom-scss/styles/base.min.scss");
  console.log('sass.compile')
  console.log(bootstrapSourceCodePath)
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


