
const CustomerSelect = require('@scripts/customer-select')

class StoreCustomerSelect extends CustomerSelect {
  constructor($parent, success, isMultiple) {
    super($parent, success, isMultiple)

    this.$relatedSelect = $parent.querySelector('.as-select')
    this.$relatedInput = $parent.querySelector('.as-input')
    
    this.onBodyClick = this.handleBodyClick.bind(this)
    this.bindEvent()
  }

  bindEvent() {
    ![...this.$list].map(($val, index) => {
      $val.addEventListener('click', () => {
        if(this.isMultiple){
          // 多选
          if (this.$relatedInput) {
            const selectValue = $val.dataset.selectValue
            if (selectValue) {
              if (this.$relatedInput.value.length > 0) {
                let arr = (this.$relatedInput.value.split('&&'))
                if (arr.indexOf(selectValue) > -1) {
                  arr = arr.filter(item =>  item != selectValue)
                } else {
                  arr = [...arr, selectValue]
                }
                let str = '';
                arr.forEach((ele,ind) => { 
                  ind != arr.length - 1 ? str += ele + '&&' : str += ele 
                });
                this.$relatedInput.value = str;
              }else{
                this.$relatedInput.value = selectValue
              }
            }
            this.$relatedInput.dispatchEvent(new Event('change', {
              bubbles: true
            }))
          }
        }else{
          // 单选
          if (this.$relatedSelect) {
            this.$relatedSelect.selectedIndex = index
            this.$relatedSelect.dispatchEvent(new Event('change', { bubbles: true }))
          }
        }
      })
    })

    document.body.addEventListener('click', this.onBodyClick)
  }

  handleBodyClick(evt) {
    const target = evt.target
    const $selectWrap = target.closest('.as-select-wrapper')
    if ($selectWrap?.querySelector('.as-store-customer-select') !== this.$parent && this.$parent.classList.contains('active')) {
      this.handleToggle()
    }
  }
}

[...document.querySelectorAll('.as-store-customer-select')]
  .forEach(($select) => {
    new StoreCustomerSelect($select, false, $select.dataset.isMultiple || false)
  })