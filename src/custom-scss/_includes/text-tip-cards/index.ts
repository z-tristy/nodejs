(()=>{
    const $contactCard = document.querySelectorAll('.as-reactff-contentCard')
    if (!$contactCard) return
    for (let i = 0; i < $contactCard.length; i++) {
       $contactCard[i].addEventListener('click',()=>{
        $contactCard[i].classList.toggle('active')
       })
      }
})()