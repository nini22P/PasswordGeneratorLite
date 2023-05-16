import React, { useState, useMemo, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './popup.css'
import { Button, Checkbox, FluentProvider, Input, Slider, Text, makeStyles, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { ChevronLeft24Filled, ChevronRight24Filled, Copy24Regular } from '@fluentui/react-icons'

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyItems: 'center',
    alignItems: "center",
    width: '200px',
    height: 'auto',
    maxWidth: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    visibility: 'hidden',
  },
});

const App = () => {
  const styles = useStyles();
  const [theme, setTheme] = useState(webLightTheme)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [number, setNumber] = useState(true)
  const [symbol, setSymbol] = useState(true)
  const [length, setLength] = useState(25)

  // 主题切换
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (mediaQuery.matches) {
        setTheme(webDarkTheme)
      } else {
        setTheme(webLightTheme)
      }
    }
    handleChange()

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // 浏览器环境下设置缩放
  useEffect(() => {
    if (!chrome.i18n) {
      const root = document.getElementById('root')
      const container = document.getElementById("container")
      root.style.marginTop = 'calc((100vh / 1.5) / 4)'
      container.style.zoom = 1.5
    }
  }, [])

  // 读取本地数据
  useEffect(() => {
    try {
      const local = JSON.parse(localStorage.getItem('local'))
      setUppercase(local.uppercase)
      setLowercase(local.lowercase)
      setNumber(local.number)
      setSymbol(local.symbol)
      if (local.length < 1) {
        setLength(1)
      } else if (local.length > 100) {
        setLength(100)
      }
      else {
        setLength(local.length)
      }
    } catch (error) {
      console.log(error)
    } finally {
      document.getElementById('container').style.visibility = 'visible'
    }
  }, [])

  // 保存数据到本地
  useEffect(() => {
    const saveLocal = () => {
      localStorage.setItem('local', JSON.stringify({ uppercase, lowercase, number, symbol, length }))
      // console.log('saveLocal')
    }
    saveLocal()
  }, [uppercase, lowercase, number, symbol, length])

  const getPassword = () => {
    let str = ''
    if (uppercase) str = str.concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    if (lowercase) str = str.concat('abcdefghijklmnopqrstuvwxyz')
    if (number) str = str.concat('01234567890123456789')
    if (symbol) str = str.concat('!@#$%^&*()_+-=[]{}:./?')
    if (str === '') {
      return ''
    }
    let password = ''
    for (let i = 0; i < length; i++) {
      password = password.concat(str[Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1)) * str.length)])
    }
    return password
  }

  const password = useMemo(
    () => getPassword(),
    [uppercase, lowercase, number, symbol, length]
  )

  return (
    <FluentProvider theme={theme}>
      <div id='container' className={styles.container}>
        <div style={{ marginTop: 10, userSelect: 'none' }} >
          <Checkbox checked={uppercase} label='大写字母' onChange={(_, data) => setUppercase(data.checked)} />
          <Checkbox checked={number} label='数字' onChange={(_, data) => setNumber(data.checked)} />
        </div>
        <div style={{ userSelect: 'none' }} >
          <Checkbox checked={lowercase} label='小写字母' onChange={(_, data) => setLowercase(data.checked)} />
          <Checkbox checked={symbol} label='符号' onChange={(_, data) => setSymbol(data.checked)} />
        </div>
        <br />
        <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          <Input
            style={{ textAlign: 'center', width: 50, margin: 'auto' }}
            value={length}
            min={1}
            max={100}
            type='number'
            onInput={(e) => setLength(e.target.value)}
          />
          <Button icon={<ChevronLeft24Filled />} onClick={() => setLength(Number(length) - 1)} />
          <Button icon={<ChevronRight24Filled />} onClick={() => setLength(Number(length) + 1)} />
          <Button icon={<Copy24Regular />} onClick={() => navigator.clipboard.writeText(password)} />
        </div>
        <br />
        <Slider style={{ width: 176 }} value={length} min={1} max={100} onChange={(e) => setLength(e.target.value)} />
        <br />
        {/* <Button style={{ width: 150 }} icon={<Copy24Regular />} onClick={() => copy()} >复制</Button>
      <br /> */}
        <Text style={{ width: 160, marginBottom: 20, wordBreak: 'break-all' }} align="center" >{password}</Text>
      </div>
    </FluentProvider>
  )
}

createRoot(document.getElementById("root")).render(
  <App />
)