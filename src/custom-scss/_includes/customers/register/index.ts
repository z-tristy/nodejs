
import { fetchConfig } from '@scripts/_utilities'
const ValidateForm = require('../../../scripts/validateForm.ts')

class RegisterWrpper {
  $registerForm: any
  $registerEmail: any
  $subscribeForm: any
  $subscribeCheckbox: any
  $subscribeEmail: any
  $subscribeUrl: any
  //默认会勾选订阅选框
  $isSubscribe:boolean = true
  constructor() {
    this.$registerForm = document.querySelector('.as-register-form')
    this.$registerEmail = this.$registerForm && this.$registerForm.querySelector('.as-register-email')
    this.$subscribeCheckbox = this.$registerForm && this.$registerForm.querySelector('#register-subscribe')
    this.$subscribeForm = document.querySelector('#_subscribe-form')
    this.$subscribeUrl = this.$subscribeForm && this.$subscribeForm.getAttribute('action')
    this.$subscribeEmail = this.$subscribeForm && this.$subscribeForm.querySelector('.as-render-email')
    this.init()
  }

  init() {
    this.listenSubscribe()
    this.renderEmail()
    this.listenSubmit()
  }

  listenSubscribe() {
    this.$subscribeCheckbox && this.$subscribeCheckbox.addEventListener('change', () => {
      if (this.$subscribeCheckbox.checked === true) {
        this.$isSubscribe = true
      } else {
        this.$isSubscribe = false
      }
    })
  }

  renderEmail() {
    this.$registerEmail && this.$registerEmail.addEventListener('change', () => {
      this.$subscribeEmail && (this.$subscribeEmail.value = this.$registerEmail.value)
      
    })
  }

  listenSubmit() {
    this.$registerForm && this.$registerForm.addEventListener('submit', (event) => {
      if (this.$isSubscribe) {
        this.submitSubscribe(event)
      }
    })
  }

  submitSubscribe(event) {
    // 火狐兼容性，需要cancelable属性
    // this.$subscribeForm.dispatchEvent(new Event('submit', { cancelable: true }))
    this.subscribe()
  }

  subscribe(){
    // let params =  'email=' + this.$subscribeEmail.value
    // let xhr = new XMLHttpRequest()
    // xhr.open('post', this.$subscribeUrl, true)
    // xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    // xhr.send(params)
    
    let body =  JSON.stringify({email: this.$subscribeEmail.value})
    fetch(this.$subscribeUrl, {...fetchConfig(), ...{ body }})
      .then((response) => {
        return response.json()
      })
      .then((parsedState) => {
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
new RegisterWrpper()