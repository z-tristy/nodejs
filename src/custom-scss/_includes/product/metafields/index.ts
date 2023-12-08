;(() => {
  const $parent = document.querySelector('.as-metafields-option-note .metafield-json')
  if ($parent === null) return
  const metafiledsJson = JSON.parse($parent.innerHTML)

  Array.from(metafiledsJson).map((val: any) => {
    const optionName: string = val.option_name
    if (Boolean(optionName)) {
      const optionClass = `.as-metafileds-option-note-${optionName.toLowerCase().replaceAll(' ', '-')}`
      const $demo = document.querySelector(optionClass)
      $demo !== null && ($demo.innerHTML = val.text)
    }
  })
})()

;(() => {
  const $parent = document.querySelector('.as-metafields-variant-note .metafield-json')
  if ($parent === null) return
  const metafiledsJson = JSON.parse($parent.innerHTML)

  Array.from(metafiledsJson).map((val: any) => {
    const optionName = val.option_value
    if (Boolean(optionName)) {
      const optionClass = `.as-metafileds-variant-note-${optionName.toLowerCase().replaceAll(' ', '-')}`
      const $demo = document.querySelector(optionClass)
      $demo !== null && ($demo.innerHTML = val.text)
      $demo?.classList.add('mt-1')
    }
  })
})()
