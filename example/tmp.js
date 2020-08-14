// ==UserScript==
// @name         typeform
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.typeform.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const $id = (i) => document.querySelector(i)
  const root = $id('#root')

  const makeEnter = () => {
    try {
      const buttons = document.querySelectorAll('button')
      for (let i = 0; i < buttons.length; i++) {
        buttons[1].click()
      }
    } catch(e) {}
  }

  function makeInput1() {
    const inputs = document.querySelectorAll('input')
    inputs[0].value = 'x9dkdk20xkd9fak2k'
    inputs[0].dispatchEvent(new Event('change'))
  }

  window.addEventListener('load', () => {
    console.log('load')
    const timer = setInterval(() => {
      if (root.style.cssText) {
        clearInterval(timer)
        makeEnter()
        setTimeout(makeInput1)
      }
    }, 100)
  })

})();