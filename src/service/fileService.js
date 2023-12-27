
import { readFileSync, writeFileSync } from "fs";

export function handleBootstrapScss(baseMinPath, basePath) {
  let baseMinData = readFileSync(baseMinPath).toString()
  let baseData = readFileSync(basePath).toString()

  baseMinData = updateFiles(baseMinData)
  writeFileSync(baseMinPath, baseMinData)

  baseData = updateFiles(baseData)
  writeFileSync(basePath, baseData)
}

function updateFiles (data) {
  // 删除 引用 bootstrap
  // const pattern = /^@import\s+"..\/..\/node_modules\/bootstrap\/scss.*?;\n/gm;
  data = data.replaceAll('../../node_modules/bootstrap/scss/', '../../bootstrap-scss/')
  // 删除 注释
  // const pattern2 = /^\/\/\s+.*?\n+/gm;
  // data = data.replace(pattern2, '')
  // 改变 ./ 路径
  // data = data.replaceAll('@import "./', '@import "../../custom-scss/styles/')
  // 改变 ../_includes 路径
  // data = data.replaceAll('@import "../_includes/', '@import "../../custom-scss/_includes/')

  return data
}



