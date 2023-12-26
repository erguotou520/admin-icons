const { execSync } = require('child_process')
const { stat, cp, readdir, writeFile } = require('node:fs/promises')
const { resolve } = require('node:path')
const { ensureDir } = require('fs-extra')

const rootPath = resolve(__dirname, '..')
const tablerRepoPath = resolve(rootPath, 'tabler')
const outputPath = resolve(rootPath, 'dist')
const tablerOutputPath = resolve(outputPath, 'tabler')

async function updateOrInstallTablerRepo() {
  try {
    await stat(tablerRepoPath)
    console.log('update tabler-icons')
    execSync('git pull', {
      cwd: tablerRepoPath
    })
  } catch(e) {
    console.log('clone tabler-icons')
    execSync('git clone --depth 1 https://github.com/tabler/tabler-icons.git tabler', {
      cwd: rootPath
    })
  }
}

async function buildTabler() {
  const iconsPath = resolve(tablerRepoPath, 'icons')
  // 读取 tabler-icons中所有svg文件，并生成索引文件
  await cp(iconsPath, resolve(tablerOutputPath, 'icons'), {
    recursive: true,
    force: false
  })
  const icons = await readdir(iconsPath)
  const indexFilePath = resolve(tablerOutputPath, 'index.json')
  await writeFile(indexFilePath, JSON.stringify(icons.map(icon => icon.replace('.svg', ''))))
}

(async () => {
  await ensureDir(tablerOutputPath)
  await updateOrInstallTablerRepo()
  await buildTabler()
})()