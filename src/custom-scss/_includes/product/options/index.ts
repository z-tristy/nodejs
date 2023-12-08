class VariantOptions extends HTMLElement {
  options: Array<String>
  variantData: Object
  $number: any
  currentVariant: any
  currentQuantity: any
  $colorSwatch: any
  constructor() {
    super()
    this.options = []
    this.variantData = {}
    this.currentVariant
    this.$number = document.querySelector('.as-form-control-number')
    this.$colorSwatch = document.querySelectorAll('.as-color-swatch')
    this.addEventListener('change', (event: Event) => {
      this.onOptionChange(event)
    })
    this.onColorChange()
    // this.initItemCheck()
  }
  onColorChange() {
    if (!this.$colorSwatch) return
    Array.from(this.$colorSwatch).map((swatch: any) => {
      let optionName = swatch.querySelector('.as-color-option-name')
      if (!optionName) return
      swatch.addEventListener('change', (event: Event) => {
        optionName.innerText = event.target.value
      })
    })
  }
  onOptionChange(evt: any) {
    this.updateOptions()
    this.updateMasterId()
    this.linkageOptions(this.options, 1)
  }
  // 获取选项
  updateOptions() {
    this.options = []
    const fieldsets: Array<HTMLElement> = Array.from(this.querySelectorAll('.as-option-wrap'))
    if (!fieldsets) return
    fieldsets.map((fieldset: HTMLElement) => {
      let validSelect: String = fieldset.querySelector('select')?.value
      let validRadio: String = Array.from(fieldset.querySelectorAll('input'))?.find((radio: HTMLElement) => radio.checked)?.value
      if (validSelect) {
        this.options.push(validSelect)
      } else {
        this.options.push(validRadio)
      }
    })
  }
  // 找到变体id
  updateMasterId() {
    if (!this.getVariantData()) return
    this.currentVariant = this.getVariantData().find((variant: any) => {
      return !variant.options.map((option: any, index: number) => {
        return this.options[index] === option
      }).includes(false)
    })
    this.updateSelected()
  }
  // 处理所有变体数据
  getVariantData() {
    let data: Element | null = this.querySelector('[type="application/json"]')
    if (!data) return
    this.variantData = JSON.parse(data.textContent || '{}')
    return this.variantData
  }
  // 检测option是否应该显示
  linkageOptions(checkedOptions: Array<String>, position: Number) {
    if (position > checkedOptions.length) {
      return
    }
    let $variants: Array<Object> = this.variantData
    let currentPos: Number = 1
    if (!$variants) return
    // 获取position位置之前的所有组合
    while (currentPos <= position) {
      $variants = Array.prototype.filter.call($variants, function ($variant) {
        return $variant[`option${currentPos}`] === checkedOptions[currentPos - 1]
      })
      currentPos ++
    }

    var tmpPos = Number(position) + 1
    var tmpIndex = -1
    var canContinue = true
    var isFirstVisibleStep = false
    var $nextStepOptions = this.querySelectorAll('.as-step-option[data-position="' + tmpPos + '"]')
    var $nextCurrentStepOption = checkedOptions[Number(position)]
    $nextStepOptions && Array.prototype.forEach.call($nextStepOptions, function ($stepOption, index) {
      var flag = Array.prototype.some.call($variants, function ($variant) {
        return $variant[`option${tmpPos}`] === $stepOption.value
      })
      // 按照变体列表不存在当前选中的step option组合
      if ($nextCurrentStepOption === $stepOption.value) {
        if (!flag) {
          canContinue = false
        }
      }
      if (flag && !isFirstVisibleStep) {
        isFirstVisibleStep = true
        tmpIndex = index
      }
      // 显示/隐藏step option
      // if ($stepOption.tagName.toLowerCase() === 'input') {
      //   $stepOption.parentNode && $stepOption.parentNode.classList.toggle('d-none', !flag)
      // } else {
      //   $stepOption.classList.toggle('d-none', !flag)
      // }
      if ($stepOption && !flag) {
        $stepOption.disabled = true
      } else {
        $stepOption.disabled = false
      }
    })

    if (canContinue) {
      this.linkageOptions(this.options, ++ position)
    } else {
      // 提前结束，触发change事件
      if ($nextStepOptions[tmpIndex]?.tagName.toLowerCase() === 'input') {
        $nextStepOptions && $nextStepOptions[tmpIndex].click()
      } else {
        if ($nextStepOptions && $nextStepOptions[tmpIndex].parentNode) {
          $nextStepOptions[tmpIndex].selected = true
          $nextStepOptions[tmpIndex].parentNode.dispatchEvent(new Event('change', {bubbles: true}))
        }
      }
    }
  }
  // 更新select选项
  updateSelected() {
    if (!this.currentVariant) return
    let selectWrap = document.querySelector('.as-product-variant')
    if (!selectWrap) return
    let select = selectWrap.querySelectorAll('.as-product-variant-option')
    let selectedVariant = Array.from(select).find((variant) => {
      return variant.value == this.currentVariant.id
    })
    if (selectedVariant) {
      selectedVariant.selected = true
    }
    selectWrap.dispatchEvent(new Event('change'))
  }

}

if (customElements.get('variant-options') === undefined) {
  customElements.define('variant-options', VariantOptions)
}
