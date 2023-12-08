
const ValidateForm = require('../../scripts/validateForm.ts')
class GoogleSheet extends ValidateForm {
  constructor ($parent: HTMLElement) {
    super($parent)

    if (!$parent) return
    this.$parent = $parent
  }

  handleSubmit () {
    this.$parent.addEventListener('submit', (event) => {
      event.preventDefault()

      this.clearMessage()
      this.freeze()
      
      const url = this.$parent?.dataset.action
      const body = new FormData(this.$parent)
      fetch(url, {
        method: 'POST',
        body: body,
      })
      .then((response) => {
        return response.json()
      })
      .then(() => {
        // 表单提交成功后，显示提交成功提示语
        this.toggleSuccess(Boolean(true))
        this.unfreeze()
      })
      .catch(() => {
        // 提交失败，显示失败提示语
        this.toggleError(Boolean(true))
        this.unfreeze()
      })
    })
  }
}

class ContactForm extends HTMLElement {
  $form: HTMLElement
  constructor() {
    super()

    this.$form = this.querySelector('.as-contact-form')
    if (!this.$form) return

    new GoogleSheet(this.$form)
  }
}

if (!customElements.get('contact-form')) {
  customElements.define('contact-form', ContactForm)
}