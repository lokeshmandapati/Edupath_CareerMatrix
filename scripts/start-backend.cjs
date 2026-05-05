/**
 * Starts Spring Boot from the backend folder.
 * Windows: must use shell for .cmd / paths with spaces (avoids spawn EINVAL on Node 20+).
 */
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const backendDir = path.join(__dirname, '..', 'backend')
const args = ['spring-boot:run']

// Auto-detect bundled JDK in project root
const bundledJdk = path.join(__dirname, '..', 'oracleJdk-26')
if (fs.existsSync(bundledJdk)) {
  process.env.JAVA_HOME = bundledJdk
  process.env.PATH = path.join(bundledJdk, 'bin') + path.delimiter + process.env.PATH
}

const bundledWin = path.join(backendDir, 'tools', 'apache-maven-3.9.6', 'bin', 'mvn.cmd')

function quoteWin(p) {
  return p.includes(' ') ? `"${p}"` : p
}

let child

if (process.platform === 'win32') {
  const useBundled = fs.existsSync(bundledWin)
  const mvnExe = useBundled ? bundledWin : 'mvn.cmd'
  // Single command line for cmd.exe — required for .cmd and paths with spaces
  const cmdLine = [quoteWin(mvnExe), ...args].join(' ')
  child = spawn(cmdLine, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
    windowsHide: true,
  })
} else {
  const mvn = fs.existsSync(path.join(backendDir, 'tools', 'apache-maven-3.9.6', 'bin', 'mvn'))
    ? path.join(backendDir, 'tools', 'apache-maven-3.9.6', 'bin', 'mvn')
    : 'mvn'
  child = spawn(mvn, args, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  })
}

child.on('exit', (code, signal) => {
  if (signal) process.exit(1)
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  console.error('[start-backend]', err.message)
  process.exit(1)
})
